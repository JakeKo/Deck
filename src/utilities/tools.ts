import PointModel from "../models/PointModel";
import ToolModel from "../models/ToolModel";
import GraphicModel from "../models/GraphicModel";
import StyleModel from "../models/StyleModel";
import * as SVG from "svg.js";

const getMousePosition: (slide: any, event: MouseEvent) => PointModel = (slide: any, event: MouseEvent): PointModel => {
    const zoom: number = slide.$store.getters.canvasZoom;
    const resolution: number = slide.$store.getters.canvasResolution;
    const bounds: DOMRect = slide.$el.getBoundingClientRect();
    return new PointModel(Math.round((event.clientX / zoom - bounds.left) * resolution), Math.round((event.clientY / zoom - bounds.top) * resolution));
};

// Cursor Tool handlers
const cursorTool: ToolModel = new ToolModel("cursor", {
    graphicMouseOver: (svg: SVG.Element) => (): any => svg.style("cursor", "pointer"),
    graphicMouseOut: (svg: SVG.Element) => (): any => svg.style("cursor", "default"),
    graphicMouseDown: (slide: any, svg: SVG.Element, graphic: GraphicModel) => (event: MouseEvent): any => {
        event.stopPropagation();
        event.preventDefault();
        slide.canvas.on("mousemove", preview);
        slide.canvas.on("mouseup", end);

        if (slide.$store.getters.focusedGraphicId !== graphic.id) {
            slide.$store.commit("focusGraphic", graphic);
            slide.$store.commit("styleEditorObject", graphic);
        }

        const start: PointModel = new PointModel(svg.x(), svg.y());
        const offset: PointModel = start.add(getMousePosition(slide, event).scale(-1));

        // Preview moving shape
        function preview(event: MouseEvent): void {
            event.stopPropagation();
            event.preventDefault();

            const resolvedPosition: PointModel = getMousePosition(slide, event).add(offset);
            svg.move(resolvedPosition.x, resolvedPosition.y);
        }

        // End moving shape
        function end(): void {
            slide.canvas.off("mousemove", preview);
            slide.canvas.off("mouseup", end);

            if (graphic.type === "polyline") {
                const flattenedPoints: Array<Array<number>> = (svg as SVG.PolyLine).array().value as any as Array<Array<number>>;
                graphic.styleModel.points = flattenedPoints.map<PointModel>((point: Array<number>): PointModel => new PointModel(point[0], point[1]));
            }

            if (graphic.type === "curve") {
                const flattenedPoints: Array<Array<number>> = (svg as SVG.Path).array().value as any as Array<Array<number>>;
                graphic.styleModel.points = [new PointModel(flattenedPoints[0][1], flattenedPoints[0][2])];
                flattenedPoints.slice(1).forEach((point: Array<number>) => {
                    graphic.styleModel.points!.push(new PointModel(point[1], point[2]));
                    graphic.styleModel.points!.push(new PointModel(point[3], point[4]));
                    graphic.styleModel.points!.push(new PointModel(point[5], point[6]));
                });
            }

            if (graphic.type === "ellipse") {
                graphic.styleModel.x = svg.cx();
                graphic.styleModel.y = svg.cy();
            }

            if (graphic.type === "rectangle" || graphic.type === "textbox") {
                graphic.styleModel.x = svg.x();
                graphic.styleModel.y = svg.y();
            }

            slide.$store.commit("styleEditorObject", undefined);
            slide.$store.commit("styleEditorObject", graphic);
            slide.refreshCanvas();
        }
    },
    canvasMouseDown: (slide: any) => (): void => {
        if (slide.$store.getters.focusedGraphicId !== "") {
            slide.$store.commit("focusGraphic", undefined);
            slide.$store.commit("styleEditorObject", undefined);
        }
    }
});

const pencilTool: ToolModel = new ToolModel("pencil", {
    canvasMouseOver: (canvas: SVG.Doc) => (): any => canvas.style("cursor", "crosshair"),
    canvasMouseOut: (canvas: SVG.Doc) => (): any => canvas.style("cursor", "default"),
    canvasMouseDown: (slide: any, canvas: SVG.Doc) => (event: MouseEvent): void => {
        event.stopPropagation();
        event.preventDefault();
        canvas.on("mousemove", preview);
        canvas.on("mouseup", end);

        slide.$store.commit("focusGraphic", undefined);
        slide.$store.commit("styleEditorObject", undefined);
        const points: Array<PointModel> = [getMousePosition(slide, event)];
        const strokeWidth: number = slide.$store.getters.canvasResolution * 3;
        const shape: SVG.PolyLine = canvas.polyline([points[0].toArray()]).fill("none").stroke("black").attr("stroke-width", strokeWidth);

        function preview(event: MouseEvent): void {
            points.push(getMousePosition(slide, event));
            shape.plot(points.map<Array<number>>((point: PointModel) => point.toArray()));
        }

        function end(): void {
            canvas.off("mousemove", preview);
            canvas.off("mouseup", end);

            const graphic = new GraphicModel({
                type: "polyline",
                styleModel: new StyleModel({
                    fill: shape.attr("fill"),
                    stroke: shape.attr("stroke"),
                    strokeWidth: shape.attr("stroke-width"),
                    points
                })
            });

            shape.remove();
            slide.$store.commit("addGraphic", { slideId: slide.id, graphic });
            slide.$store.commit("styleEditorObject", graphic);
            slide.$store.commit("focusGraphic", graphic);
        }
    }
});

let penToolIsActive: boolean = false;
const penTool: ToolModel = new ToolModel("pen", {
    canvasMouseOver: (canvas: SVG.Doc) => (): any => canvas.style("cursor", "crosshair"),
    canvasMouseOut: (canvas: SVG.Doc) => (): any => canvas.style("cursor", "default"),
    canvasMouseDown: (slide: any, canvas: SVG.Doc) => (event: MouseEvent): void => {
        // Prevent any action on canvas click if a bezier curve is being drawn
        if (penToolIsActive) { return; }
        else { penToolIsActive = true; }

        event.stopPropagation();
        event.preventDefault();
        document.addEventListener("keydown", end);
        canvas.on("mousemove", preview);
        canvas.on("mouseup", setFirstControlPoint);

        slide.$store.commit("focusGraphic", undefined);
        slide.$store.commit("styleEditorObject", undefined);
        const start: PointModel = getMousePosition(slide, event);
        const curve: Array<Array<PointModel>> = [[start]];
        const curveSegment: Array<Array<PointModel | undefined>> = [[start], [undefined, undefined, undefined]];

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
            event.stopPropagation();
            event.preventDefault();
            canvas.off("mousedown", setEndpoint);
            canvas.on("mouseup", setSecondControlPoint);

            curveSegment[1][2] = getMousePosition(slide, event);
        }

        function setSecondControlPoint(event: MouseEvent): void {
            canvas.off("mouseup", setSecondControlPoint);

            // Complete the curve segment and add it to the final curve
            curveSegment[1][1] = getMousePosition(slide, event).reflect(curveSegment[1][2]);
            curve.push(curveSegment[1] as Array<PointModel>);
            curveGraphic.plot(toBezierString(curve));

            // Reset the curve segment and set the first control point
            curveSegment[0] = [curveSegment[1][2]];
            curveSegment[1] = [undefined, undefined, undefined];
            setFirstControlPoint(event);
        }

        function preview(event: MouseEvent): void {
            // Redraw the current curve segment as the mouse moves around
            const position: PointModel = getMousePosition(slide, event);
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
            // Remove the last curve because it will always have some undefned points
            const points: Array<PointModel> = [];
            curve.forEach((c: Array<PointModel | undefined>) => points.push(...(c as Array<PointModel>)));

            const graphic = new GraphicModel({
                type: "curve",
                styleModel: new StyleModel({
                    fill: curveGraphic.attr("fill"),
                    stroke: curveGraphic.attr("stroke"),
                    strokeWidth: curveGraphic.attr("stroke-width"),
                    points
                })
            });

            // Remove the shape visually - if it is more than just a point, persist it to the slide, then refresh the style editor
            controlPointGraphic.remove();
            curveSegmentGraphic.remove();
            curveGraphic.remove();

            if (points.length > 1) {
                slide.$store.commit("addGraphic", { slideId: slide.id, graphic });
                slide.$store.commit("styleEditorObject", graphic);
                slide.$store.commit("focusGraphic", graphic);
            }
        }

        // Convert a curve with possible undefined values to a curve with defined fallback values
        function resolveCurve(curve: Array<Array<PointModel | undefined>>, defaultPoint: PointModel): Array<Array<PointModel>> {
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
        function toBezierString(curves: Array<Array<PointModel>>): string {
            const points: string = curves.slice(1)
                .map<string>((curve: Array<PointModel>): string => ` C ${curve.map<string>((point: PointModel) => `${point.x},${point.y}`).join(" ")}`)
                .join(" ");

            return `M ${curves[0][0].x},${curves[0][0].y} ${points}`;
        }
    }
});

// Rectangle tool handlers
const rectangleTool: ToolModel = new ToolModel("rectangle", {
    canvasMouseOver: (canvas: SVG.Doc) => (): any => canvas.style("cursor", "crosshair"),
    canvasMouseOut: (canvas: SVG.Doc) => (): any => canvas.style("cursor", "default"),
    canvasMouseDown: (slide: any, canvas: SVG.Doc) => (event: MouseEvent): void => {
        event.stopPropagation();
        event.preventDefault();
        canvas.on("mousemove", preview);
        canvas.on("mouseup", end);
        document.addEventListener("keydown", toggleSquare);
        document.addEventListener("keyup", toggleSquare);

        slide.$store.commit("focusGraphic", undefined);
        slide.$store.commit("styleEditorObject", undefined);
        const start: PointModel = getMousePosition(slide, event);
        const shape: SVG.Rect = canvas.rect().move(start.x, start.y);
        let lastPosition: PointModel = new PointModel(event.clientX, event.clientY);

        // Preview drawing rectangle
        function preview(event: MouseEvent): void {
            // Determine dimensions for a rectangle or square (based on if shift is pressed)
            lastPosition = new PointModel(event.clientX, event.clientY);
            const position: PointModel = getMousePosition(slide, event);
            const rawDimensions: PointModel = position.add(start.scale(-1));
            const minimumDimension: number = Math.min(Math.abs(rawDimensions.x), Math.abs(rawDimensions.y));
            const dimensions: PointModel = event.shiftKey
                ? new PointModel(Math.sign(rawDimensions.x) * minimumDimension, Math.sign(rawDimensions.y) * minimumDimension)
                : rawDimensions;

            // Check if the dimensions are negative and move (x, y) or resize
            const move: PointModel = event.shiftKey ? start.add(dimensions) : position;
            shape.move(dimensions.x < 0 ? move.x : start.x, dimensions.y < 0 ? move.y : start.y);
            shape.size(Math.abs(dimensions.x), Math.abs(dimensions.y));
        }

        // End drawing rectangle
        function end(): void {
            canvas.off("mousemove", preview);
            canvas.off("mouseup", end);
            document.removeEventListener("keydown", toggleSquare);
            document.removeEventListener("keyup", toggleSquare);

            const graphic: GraphicModel = new GraphicModel({
                type: "rectangle",
                styleModel: new StyleModel({
                    fill: shape.attr("fill"),
                    x: shape.x(),
                    y: shape.y(),
                    width: shape.width(),
                    height: shape.height()
                })
            });

            shape.remove();
            slide.$store.commit("addGraphic", { slideId: slide.id, graphic });
            slide.$store.commit("styleEditorObject", graphic);
            slide.$store.commit("focusGraphic", graphic);
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

const ellipseTool: ToolModel = new ToolModel("ellipse", {
    canvasMouseOver: (canvas: SVG.Doc) => (): any => canvas.style("cursor", "crosshair"),
    canvasMouseOut: (canvas: SVG.Doc) => (): any => canvas.style("cursor", "default"),
    canvasMouseDown: (slide: any, canvas: SVG.Doc) => (event: MouseEvent): void => {
        event.stopPropagation();
        event.preventDefault();
        canvas.on("mousemove", preview);
        canvas.on("mouseup", end);
        document.addEventListener("keydown", toggleCircle);
        document.addEventListener("keyup", toggleCircle);

        slide.$store.commit("focusGraphic", undefined);
        slide.$store.commit("styleEditorObject", undefined);
        const start: PointModel = getMousePosition(slide, event);
        const shape: SVG.Ellipse = canvas.ellipse().center(start.x, start.y);
        let lastPosition: PointModel = new PointModel(event.clientX, event.clientY);

        // Preview drawing ellipse
        function preview(event: MouseEvent): void {
            // Determine dimensions for an ellipse or circle (based on if shift is pressed)
            lastPosition = new PointModel(event.clientX, event.clientY);
            const position: PointModel = getMousePosition(slide, event);
            const rawOffset: PointModel = position.add(start.scale(-1));
            const minimumOffset: number = Math.min(Math.abs(rawOffset.x), Math.abs(rawOffset.y));
            const resolvedOffset: PointModel = event.shiftKey
                ? new PointModel(Math.sign(rawOffset.x) * minimumOffset, Math.sign(rawOffset.y) * minimumOffset) : rawOffset;
            const center: PointModel = start.add(start).add(resolvedOffset).scale(0.5);

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

            const graphic: GraphicModel = new GraphicModel({
                type: "ellipse",
                styleModel: new StyleModel({
                    fill: shape.attr("fill"),
                    x: shape.cx(),
                    y: shape.cy(),
                    width: shape.width(),
                    height: shape.height()
                })
            });

            shape.remove();
            slide.$store.commit("addGraphic", { slideId: slide.id, graphic });
            slide.$store.commit("styleEditorObject", graphic);
            slide.$store.commit("focusGraphic", graphic);
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

const textboxTool: ToolModel = new ToolModel("textbox", {
    canvasMouseOver: (canvas: SVG.Doc) => (): any => canvas.style("cursor", "text"),
    canvasMouseOut: (canvas: SVG.Doc) => (): any => canvas.style("cursor", "default"),
    canvasMouseDown: (slide: any) => (event: MouseEvent): void => {
        event.stopPropagation();
        event.preventDefault();

        slide.$store.commit("focusGraphic", undefined);
        slide.$store.commit("styleEditorObject", undefined);
        const position = getMousePosition(slide, event);
        const graphic = new GraphicModel({
            type: "textbox",
            styleModel: new StyleModel({
                x: position.x,
                y: position.y,
                message: "lorem ipsum\ndolor sit amet"
            })
        });

        slide.$store.commit("addGraphic", { slideId: slide.id, graphic });
        slide.$store.commit("styleEditorObject", graphic);
        slide.$store.commit("focusGraphic", graphic);
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
