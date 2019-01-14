import Point from "../models/Point";
import Tool from "../models/Tool";
import IGraphic from "../models/IGraphic";
import Rectangle from "../models/Rectangle";
import Ellipse from "../models/Ellipse";
import Curve from "../models/Curve";
import Sketch from "../models/Sketch";
import Text from "../models/Text";
import * as SVG from "svg.js";
import BoundingBox from "../models/BoundingBox";

function getMousePosition(slide: any, event: MouseEvent): Point {
    const zoom: number = slide.$store.getters.canvasZoom;
    const resolution: number = slide.$store.getters.canvasResolution;
    const bounds: DOMRect = slide.$el.getBoundingClientRect();
    return new Point(Math.round((event.clientX / zoom - bounds.left) * resolution), Math.round((event.clientY / zoom - bounds.top) * resolution));
}

function addGraphic(slide: any, graphic: IGraphic): void {
    slide.$store.commit("addGraphic", { slideId: slide.id, graphic });
    focusGraphic(slide, graphic);
}

function focusGraphic(slide: any, graphic?: IGraphic): void {
    slide.$store.commit("focusGraphic", graphic);
    slide.$store.commit("styleEditorObject", graphic);
}

function isolateEvent(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
}

// Cursor Tool handlers
const cursorTool: Tool = new Tool("cursor", {
    graphicMouseOver: (svg: SVG.Element) => (): any => svg.style("cursor", "pointer"),
    graphicMouseOut: (svg: SVG.Element) => (): any => svg.style("cursor", "default"),
    graphicMouseDown: (slide: any, svg: SVG.Element, graphic: IGraphic) => (event: MouseEvent): any => {
        isolateEvent(event);

        slide.canvas.on("mousemove", preview);
        slide.canvas.on("mouseup", end);

        if (slide.$store.getters.focusedGraphic === undefined || slide.$store.getters.focusedGraphic.id !== graphic.id) {
            focusGraphic(slide, graphic);
        }

        const start: Point = new Point(svg.x(), svg.y());
        const offset: Point = start.add(getMousePosition(slide, event).scale(-1));
        const boundingBox: BoundingBox = slide.$store.getters.activeSlide.graphics.find((g: IGraphic): boolean => g.id === graphic.boundingBoxId) as BoundingBox;

        // Preview moving shape
        function preview(event: MouseEvent): void {
            isolateEvent(event);

            const resolvedPosition: Point = getMousePosition(slide, event).add(offset);
            svg.move(resolvedPosition.x, resolvedPosition.y);
            boundingBox.origin = resolvedPosition;
        }

        // End moving shape
        function end(): void {
            slide.canvas.off("mousemove", preview);
            slide.canvas.off("mouseup", end);

            // Update the graphic model based on the modifications made to the graphic render
            if (graphic instanceof Rectangle) {
                (graphic as Rectangle).origin = new Point(svg.x(), svg.y());
            } else if (graphic instanceof Ellipse) {
                (graphic as Ellipse).center = new Point(svg.cx(), svg.cy());
            } else if (graphic instanceof Curve) {
                const flattenedPoints: Array<Array<number>> = (svg as SVG.Path).array().value as any as Array<Array<number>>;
                (graphic as Curve).points = [new Point(flattenedPoints[0][1], flattenedPoints[0][2])];
                flattenedPoints.slice(1).forEach((point: Array<number>) => {
                    (graphic as Curve).points.push(new Point(point[1], point[2]));
                    (graphic as Curve).points.push(new Point(point[3], point[4]));
                    (graphic as Curve).points.push(new Point(point[5], point[6]));
                });
            } else if (graphic instanceof Sketch) {
                const flattenedPoints: Array<Array<number>> = (svg as SVG.PolyLine).array().value as any as Array<Array<number>>;
                (graphic as Sketch).points = flattenedPoints.map<Point>((point: Array<number>): Point => new Point(point[0], point[1]));
            } else if (graphic instanceof Text) {
                (graphic as Text).origin = new Point(svg.x(), svg.y());
            }

            slide.$store.commit("styleEditorObject", undefined);
            slide.$store.commit("styleEditorObject", graphic);
            slide.refreshCanvas();
        }
    },
    canvasMouseDown: (slide: any) => (): void => {
        if (slide.$store.getters.focusedGraphic !== undefined) {
            focusGraphic(slide, undefined);
        }
    }
});

// Event handlers for using the pencil tool
const pencilTool: Tool = new Tool("pencil", {
    canvasMouseOver: (canvas: SVG.Doc) => (): any => canvas.style("cursor", "crosshair"),
    canvasMouseOut: (canvas: SVG.Doc) => (): any => canvas.style("cursor", "default"),
    canvasMouseDown: (slide: any, canvas: SVG.Doc) => (event: MouseEvent): void => {
        event.stopPropagation();
        event.preventDefault();
        canvas.on("mousemove", preview);
        canvas.on("mouseup", end);

        // Unfocus the current graphic if any and set initial state of pencil drawing
        slide.$store.commit("focusGraphic", undefined);
        slide.$store.commit("styleEditorObject", undefined);
        const points: Array<Point> = [getMousePosition(slide, event)];
        const shape: SVG.PolyLine = canvas.polyline([points[0].toArray()]).fill("none").stroke("black").attr("stroke-width", slide.$store.getters.canvasResolution * 3);

        // Add the current mouse position to the list of points to plot
        function preview(event: MouseEvent): void {
            points.push(getMousePosition(slide, event));
            shape.plot(points.map<Array<number>>((point: Point): Array<number> => point.toArray()));
        }

        // Unbind handlers and commit graphic to the application
        function end(): void {
            canvas.off("mousemove", preview);
            canvas.off("mouseup", end);
            shape.remove();

            const sketch: Sketch = Sketch.model(shape);
            slide.$store.commit("addGraphic", { slideId: slide.id, graphic: sketch });
            slide.$store.commit("focusGraphic", sketch);
            slide.$store.commit("styleEditorObject", sketch);
        }
    }
});

let penToolIsActive: boolean = false;
const penTool: Tool = new Tool("pen", {
    canvasMouseOver: (canvas: SVG.Doc) => (): any => canvas.style("cursor", "crosshair"),
    canvasMouseOut: (canvas: SVG.Doc) => (): any => canvas.style("cursor", "default"),
    canvasMouseDown: (slide: any, canvas: SVG.Doc) => (event: MouseEvent): void => {
        // Prevent any action on canvas click if a bezier curve is being drawn
        if (penToolIsActive) { return; }
        else { penToolIsActive = true; }

        isolateEvent(event);
        document.addEventListener("keydown", end);
        canvas.on("mousemove", preview);
        canvas.on("mouseup", setFirstControlPoint);

        focusGraphic(slide, undefined);
        const start: Point = getMousePosition(slide, event);
        const curve: Array<Array<Point>> = [[start]];
        const curveSegment: Array<Array<Point | undefined>> = [[start], [undefined, undefined, undefined]];

        // Create SVGs for the primary curve, the editable curve segment, and the control point preview
        const resolution: number = slide.$store.getters.canvasResolution;
        const curveGraphic: SVG.Path = canvas.path(toBezierString(curve)).fill("none").stroke("black").attr("stroke-width", resolution * 3);
        const curveSegmentGraphic: SVG.Path = canvas.path(toBezierString(resolveCurve(curveSegment, start)))
            .fill("none").stroke("black").attr("stroke-width", resolution * 3);
        const controlPointGraphic: SVG.PolyLine = canvas.polyline([]).fill("none").attr("stroke-width", resolution);

        function setFirstControlPoint(event: MouseEvent): void {
            canvas.off("mouseup", setFirstControlPoint);
            canvas.on("mousedown", setEndpoint);

            curveSegment[1][0] = getMousePosition(slide, event);
        }

        function setEndpoint(event: MouseEvent): void {
            isolateEvent(event);
            canvas.off("mousedown", setEndpoint);
            canvas.on("mouseup", setSecondControlPoint);

            curveSegment[1][2] = getMousePosition(slide, event);
        }

        function setSecondControlPoint(event: MouseEvent): void {
            canvas.off("mouseup", setSecondControlPoint);

            // Complete the curve segment and add it to the final curve
            curveSegment[1][1] = getMousePosition(slide, event).reflect(curveSegment[1][2]);
            curve.push(curveSegment[1] as Array<Point>);
            curveGraphic.plot(toBezierString(curve));

            // Reset the curve segment and set the first control point
            curveSegment[0] = [curveSegment[1][2]];
            curveSegment[1] = [undefined, undefined, undefined];
            setFirstControlPoint(event);
        }

        function preview(event: MouseEvent): void {
            // Redraw the current curve segment as the mouse moves around
            const position: Point = getMousePosition(slide, event);
            curveSegmentGraphic.plot(toBezierString(resolveCurve(curveSegment, position)));

            // Display the control point shape if the endpoint is defined
            if (curveSegment[1][2] !== undefined) {
                controlPointGraphic.plot([position.reflect(curveSegment[1][2]).toArray(), position.toArray()]).stroke("blue");
            } else {
                controlPointGraphic.stroke("none");
            }
        }

        function end(event: KeyboardEvent): void {
            // Check if the pressed key is not one of the specified keys to end the curve drawing
            if (["Escape", "Enter", "Tab"].indexOf(event.key) === -1) {
                return;
            }

            penToolIsActive = false;
            document.removeEventListener("keydown", end);
            canvas.off("mousemove", preview);

            // Flatten the representation of curves into a list of points
            const points: Array<Point> = [];
            curve.forEach((c: Array<Point | undefined>) => points.push(...(c as Array<Point>)));

            // Remove the shape visually - if it is more than just a point, persist it to the slide, then refresh the style editor
            controlPointGraphic.remove();
            curveSegmentGraphic.remove();
            curveGraphic.remove();

            if (points.length > 1) {
                addGraphic(slide, Curve.model(curveGraphic));
            }
        }

        // Convert a curve with possible undefined values to a curve with defined fallback values
        function resolveCurve(curve: Array<Array<Point | undefined>>, defaultPoint: Point): Array<Array<Point>> {
            return [
                [curve[0][0] || defaultPoint],
                [
                    curve[1][0] || defaultPoint,
                    curve[1][1] || (curve[1][2] ? defaultPoint.reflect(curve[1][2]) : defaultPoint),
                    curve[1][2] || defaultPoint
                ]
            ];
        }

        // Turns an array of curves into bezier curve string format
        function toBezierString(curves: Array<Array<Point>>): string {
            const points: string = curves.slice(1)
                .map<string>((curve: Array<Point>): string => ` C ${curve.map<string>((point: Point) => `${point.x},${point.y}`).join(" ")}`)
                .join(" ");

            return `M ${curves[0][0].x},${curves[0][0].y} ${points}`;
        }
    }
});

// Rectangle tool handlers
const rectangleTool: Tool = new Tool("rectangle", {
    canvasMouseOver: (canvas: SVG.Doc) => (): any => canvas.style("cursor", "crosshair"),
    canvasMouseOut: (canvas: SVG.Doc) => (): any => canvas.style("cursor", "default"),
    canvasMouseDown: (slide: any, canvas: SVG.Doc) => (event: MouseEvent): void => {
        isolateEvent(event);
        canvas.on("mousemove", preview);
        canvas.on("mouseup", end);
        document.addEventListener("keydown", toggleSquare);
        document.addEventListener("keyup", toggleSquare);

        focusGraphic(slide, undefined);
        const start: Point = getMousePosition(slide, event);
        const shape: SVG.Rect = canvas.rect().move(start.x, start.y);
        let lastPosition: Point = new Point(event.clientX, event.clientY);

        // Preview drawing rectangle
        function preview(event: MouseEvent): void {
            // Determine dimensions for a rectangle or square (based on if shift is pressed)
            lastPosition = new Point(event.clientX, event.clientY);
            const position: Point = getMousePosition(slide, event);
            const rawDimensions: Point = position.add(start.scale(-1));
            const minimumDimension: number = Math.min(Math.abs(rawDimensions.x), Math.abs(rawDimensions.y));
            const dimensions: Point = event.shiftKey
                ? new Point(Math.sign(rawDimensions.x) * minimumDimension, Math.sign(rawDimensions.y) * minimumDimension)
                : rawDimensions;

            // Check if the dimensions are negative and move (x, y) or resize
            const move: Point = event.shiftKey ? start.add(dimensions) : position;
            shape.move(dimensions.x < 0 ? move.x : start.x, dimensions.y < 0 ? move.y : start.y);
            shape.size(Math.abs(dimensions.x), Math.abs(dimensions.y));
        }

        // End drawing rectangle
        function end(): void {
            canvas.off("mousemove", preview);
            canvas.off("mouseup", end);
            document.removeEventListener("keydown", toggleSquare);
            document.removeEventListener("keyup", toggleSquare);
            shape.remove();
            addGraphic(slide, Rectangle.model(shape));
        }

        function toggleSquare(event: KeyboardEvent): void {
            if (event.key === "Shift") {
                preview(new MouseEvent("mousemove", {
                    shiftKey: event.type === "keydown",
                    clientX: lastPosition.x,
                    clientY: lastPosition.y
                }));
            }
        }
    }
});

const ellipseTool: Tool = new Tool("ellipse", {
    canvasMouseOver: (canvas: SVG.Doc) => (): any => canvas.style("cursor", "crosshair"),
    canvasMouseOut: (canvas: SVG.Doc) => (): any => canvas.style("cursor", "default"),
    canvasMouseDown: (slide: any, canvas: SVG.Doc) => (event: MouseEvent): void => {
        isolateEvent(event);
        canvas.on("mousemove", preview);
        canvas.on("mouseup", end);
        document.addEventListener("keydown", toggleCircle);
        document.addEventListener("keyup", toggleCircle);

        focusGraphic(slide, undefined);
        const start: Point = getMousePosition(slide, event);
        const shape: SVG.Ellipse = canvas.ellipse().center(start.x, start.y);
        let lastPosition: Point = new Point(event.clientX, event.clientY);

        // Preview drawing ellipse
        function preview(event: MouseEvent): void {
            // Determine dimensions for an ellipse or circle (based on if shift is pressed)
            lastPosition = new Point(event.clientX, event.clientY);
            const position: Point = getMousePosition(slide, event);
            const rawOffset: Point = position.add(start.scale(-1));
            const minimumOffset: number = Math.min(Math.abs(rawOffset.x), Math.abs(rawOffset.y));
            const resolvedOffset: Point = event.shiftKey
                ? new Point(Math.sign(rawOffset.x) * minimumOffset, Math.sign(rawOffset.y) * minimumOffset) : rawOffset;
            const center: Point = start.add(start).add(resolvedOffset).scale(0.5);

            // Check if the dimensions are negative and move (x, y) or resize
            shape.center(center.x, center.y);
            shape.size(Math.abs(resolvedOffset.x), Math.abs(resolvedOffset.y));
        }

        // End drawing ellipse
        function end(): void {
            canvas.off("mousemove", preview);
            canvas.off("mouseup", end);
            document.removeEventListener("keydown", toggleCircle);
            document.removeEventListener("keyup", toggleCircle);
            shape.remove();
            addGraphic(slide, Ellipse.model(shape));
        }

        function toggleCircle(event: KeyboardEvent): void {
            if (event.key === "Shift") {
                preview(new MouseEvent("mousemove", {
                    shiftKey: event.type === "keydown",
                    clientX: lastPosition.x,
                    clientY: lastPosition.y
                }));
            }
        }
    }
});

const textboxTool: Tool = new Tool("textbox", {
    canvasMouseOver: (canvas: SVG.Doc) => (): any => canvas.style("cursor", "text"),
    canvasMouseOut: (canvas: SVG.Doc) => (): any => canvas.style("cursor", "default"),
    canvasMouseDown: (slide: any, canvas: SVG.Doc) => (event: MouseEvent): void => {
        isolateEvent(event);
        focusGraphic(slide, undefined);
        const position: Point = getMousePosition(slide, event);
        const svg: SVG.Text = canvas.text("lorem ipsum\ndolor sit amet").move(position.x, position.y).remove();
        addGraphic(slide, Text.model(svg));
    }
});

export default {
    cursorTool,
    pencilTool,
    penTool,
    rectangleTool,
    ellipseTool,
    textboxTool
};
