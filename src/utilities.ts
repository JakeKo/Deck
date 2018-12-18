import * as SVG from "svg.js";
import Point from "./models/Point";
import GraphicModel from "./models/GraphicModel";
import ToolModel from "./models/ToolModel";
import StyleModel from "./models/StyleModel";

const getMousePosition: (slide: any, event: MouseEvent) => Point = (slide: any, event: MouseEvent): Point => {
    const zoom: number = slide.$store.getters.canvasZoom;
    const resolution: number = slide.$store.getters.canvasResolution;
    const bounds: DOMRect = slide.$el.getBoundingClientRect();
    return new Point(Math.round((event.clientX / zoom - bounds.left) * resolution), Math.round((event.clientY / zoom - bounds.top) * resolution));
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

        const start: Point = new Point(svg.x(), svg.y());
        const offset: Point = start.add(getMousePosition(slide, event).scale(-1));

        // Preview moving shape
        function preview(event: MouseEvent): void {
            event.stopPropagation();
            event.preventDefault();

            const resolvedPosition: Point = getMousePosition(slide, event).add(offset);
            svg.move(resolvedPosition.x, resolvedPosition.y);
        }

        // End moving shape
        function end(): void {
            slide.canvas.off("mousemove", preview);
            slide.canvas.off("mouseup", end);

            if (graphic.type === "polyline") {
                const flattenedPoints: Array<Array<number>> = (svg as SVG.PolyLine).array().value as any as Array<Array<number>>;
                graphic.styleModel.points = flattenedPoints.map<Point>((point: Array<number>): Point => new Point(point[0], point[1]));
            }

            if (graphic.type === "curve") {
                const flattenedPoints: Array<Array<number>> = (svg as SVG.Path).array().value as any as Array<Array<number>>;
                graphic.styleModel.points = [new Point(flattenedPoints[0][1], flattenedPoints[0][2])];
                flattenedPoints.slice(1).forEach((point: Array<number>) => {
                    graphic.styleModel.points!.push(new Point(point[1], point[2]));
                    graphic.styleModel.points!.push(new Point(point[3], point[4]));
                    graphic.styleModel.points!.push(new Point(point[5], point[6]));
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
        const points: Array<Point> = [getMousePosition(slide, event)];
        const strokeWidth: number = slide.$store.getters.canvasResolution * 3;
        const shape: SVG.PolyLine = canvas.polyline([points[0].toArray()]).fill("none").stroke("black").attr("stroke-width", strokeWidth);

        function preview(event: MouseEvent): void {
            points.push(getMousePosition(slide, event));
            shape.plot(points.map<Array<number>>((point: Point) => point.toArray()));
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
                controlPointGraphic.plot([position.reflect(curveSegment[1][2]).toArray(), position.toArray()]).stroke(slide.$store.getters.theme.information);
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
            const points: Array<Point> = [];
            curve.forEach((c: Array<Point | undefined>) => points.push(...(c as Array<Point>)));

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
const rectangleTool: ToolModel = new ToolModel("rectangle", {
    canvasMouseOver: (canvas: SVG.Doc) => (): any => canvas.style("cursor", "crosshair"),
    canvasMouseOut: (canvas: SVG.Doc) => (): any => canvas.style("cursor", "default"),
    canvasMouseDown: (slide: any, canvas: SVG.Doc) => (event: MouseEvent): void => {
        event.stopPropagation();
        event.preventDefault();
        canvas.on("mousemove", preview);
        canvas.on("mouseup", end);

        slide.$store.commit("focusGraphic", undefined);
        slide.$store.commit("styleEditorObject", undefined);
        const start: Point = getMousePosition(slide, event);
        const shape: SVG.Rect = canvas.rect().move(start.x, start.y);

        // Preview drawing rectangle
        function preview(event: MouseEvent): void {
            // Determine dimensions for a rectangle or square (based on if shift is pressed)
            const position: Point = getMousePosition(slide, event);
            const rawDimensions: Point = position.add(start.scale(-1));
            const minimumDimension = Math.min(Math.abs(rawDimensions.x), Math.abs(rawDimensions.y));
            const dimensions: Point = slide.$store.getters.pressedKeys[16]
                ? new Point(Math.sign(rawDimensions.x) * minimumDimension, Math.sign(rawDimensions.y) * minimumDimension)
                : rawDimensions;

            // Check if the dimensions are negative and move (x, y) or resize
            const move: Point = slide.$store.getters.pressedKeys[16] ? start.add(dimensions) : position;
            shape.move(dimensions.x < 0 ? move.x : start.x, dimensions.y < 0 ? move.y : start.y);
            shape.size(Math.abs(dimensions.x), Math.abs(dimensions.y));
        }

        // End drawing rectangle
        function end(): void {
            canvas.off("mousemove", preview);
            canvas.off("mouseup", end);

            const graphic = new GraphicModel({
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

        slide.$store.commit("focusGraphic", undefined);
        slide.$store.commit("styleEditorObject", undefined);
        const start: Point = getMousePosition(slide, event);
        const shape: SVG.Ellipse = canvas.ellipse().center(start.x, start.y);

        // Preview drawing ellipse
        function preview(event: MouseEvent): void {
            // Determine dimensions for an ellipse or circle (based on if shift is pressed)
            const position: Point = getMousePosition(slide, event);
            const rawOffset: Point = position.add(start.scale(-1));
            const minimumOffset = Math.min(Math.abs(rawOffset.x), Math.abs(rawOffset.y));
            const resolvedOffset: Point = slide.$store.getters.pressedKeys[16]
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

            const graphic = new GraphicModel({
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

const toPrettyString: (object: any, indentDepth: number) => string = (object: any, indentDepth: number): string => {
    if (object === undefined) {
        return "";
    }

    const propertiesString: Array<string> = [];
    for (const property in object) {
        const value: any = object[property];

        if (typeof value === "number" || typeof value === "boolean") {
            propertiesString.push(`${space(indentDepth)}"${property}": ${value}`);
        } else if (typeof value === "string") {
            propertiesString.push(`${space(indentDepth)}"${property}": ${JSON.stringify(value)}`);
        } else if (Array.isArray(value)) {
            const arrayString: Array<string> = value.map<string>((element: any): string => `${space(indentDepth + 1)}${toPrettyString(element, indentDepth + 2)}`);
            propertiesString.push(`${space(indentDepth)}"${property}": [\n${arrayString.join(",\n")}\n${space(indentDepth)}]`);
        } else if (typeof value === "object") {
            propertiesString.push(`${space(indentDepth)}"${property}": ${toPrettyString(value, indentDepth + 1)}`);
        }
    }

    return `{\n${propertiesString.join(",\n")}\n${space(indentDepth - 1)}}`;

    function space(indentDepth: number): string {
        return new Array(indentDepth * 4).fill(" ").join("");
    }
};

const renderGraphic: (graphic: GraphicModel, canvas: SVG.Doc) => SVG.Element = (graphic: GraphicModel, canvas: SVG.Doc): SVG.Element => {
    const style: StyleModel = graphic.styleModel;

    if (graphic.type === "rectangle") {
        return canvas.rect(style.width, style.height)
            .move(style.x!, style.y!)
            .fill(style.fill!);
    } else if (graphic.type === "textbox") {
        return canvas.text(style.message || "")
            .move(style.x!, style.y!);
    } else if (graphic.type === "polyline") {
        return canvas.polyline(style.points!.map((point: Point) => point.toArray()))
            .fill(style.fill!)
            .stroke(style.stroke!)
            .attr("stroke-width", style.strokeWidth);
    } else if (graphic.type === "curve") {
        let points: string = `M ${style.points![0].x},${style.points![0].y}`;
        style.points!.slice(1).forEach((point: Point, index: number) => {
            points += `${index % 3 === 0 ? " C" : ""} ${point.x},${point.y}`;
        });

        return canvas.path(points)
            .fill(style.fill!)
            .stroke(style.stroke!)
            .attr("stroke-width", style.strokeWidth);
    } else if (graphic.type === "ellipse") {
        return canvas.ellipse(style.width, style.height)
            .center(style.x!, style.y!)
            .fill(style.fill!);
    }

    throw `Undefined type of graphic: ${graphic.type}`;
};

const generateId: () => string = (): string => {
    const s4 = () => Math.floor((Math.random() + 1) * 0x10000).toString(16).substring(1).toLocaleUpperCase();
    return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
};

const deckScript: string = `<style>
html,
body {
    margin: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background: black;
}

.slide {
    box-sizing: border-box;
    margin: 0;
    display: none;
    background: white;
}

.slide:first-child {
    display: block;
}

svg {
    height: 100%;
    width: 100%;
}
</style>

<script>
let slideIndex = 0;
const slides = document.getElementsByClassName("slide");

(function () {
    window.addEventListener("resize", event => {
        event.preventDefault();
        resizeSlides();
    });

    window.addEventListener("keydown", event => {
        event = event || window.event;

        if (event.keyCode === 37) {
            event.preventDefault();
            rewindSlide();
        } else if (event.keyCode === 39) {
            event.preventDefault();
            advanceSlide()
        }
    });

    resizeSlides();
})();

function resizeSlides() {
    let height = window.innerHeight;
    let width = window.innerWidth;

    if (16 * height < 9 * width) {
        width = 16 * height / 9;
    } else if (16 * height >= 9 * width) {
        height = 9 * width / 16;
    }

    for (let i = 0; i < slides.length; i++) {
        slides[i].style.height = height + "px";
        slides[i].style.width = width + "px";
    }
}

function advanceSlide() {
    slides[slideIndex].style.display = "none";
    slideIndex = (slideIndex + 1) % slides.length;
    slides[slideIndex].style.display = "block";
}

function rewindSlide() {
    slides[slideIndex].style.display = "none";
    if (slideIndex === 0) slideIndex = slides.length - 1;
    else slideIndex = (slideIndex - 1) % slides.length;
    slides[slideIndex].style.display = "block";
}
</script>`;

export default {
    cursorTool,
    pencilTool,
    penTool,
    rectangleTool,
    ellipseTool,
    textboxTool,
    toPrettyString,
    renderGraphic,
    generateId,
    deckScript
};
