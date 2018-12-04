import EditorLineModel from "./models/EditorLineModel";
import EditorBlockModel from "./models/EditorBlockModel";
import * as SVG from "svg.js";
import Point from "./models/Point";
import GraphicModel from "./models/GraphicModel";
import ToolModel from "./models/ToolModel";
import StyleModel from "./models/StyleModel";

const getMousePosition = (slide: any, event: MouseEvent): Point => {
    const zoom: number = slide.$store.getters.canvasZoom;
    const bounds: DOMRect = slide.$el.getBoundingClientRect();
    return new Point(Math.round(event.clientX / zoom - bounds.left), Math.round(event.clientY / zoom - bounds.top));
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

        let zoom: number = slide.$store.getters.canvasZoom;
        const offset = new Point(event.clientX / zoom - svg.x(), event.clientY / zoom - svg.y());

        // Preview moving shape
        function preview(event: MouseEvent): void {
            zoom = slide.$store.getters.canvasZoom;
            svg.move(Math.round(event.clientX / zoom - offset.x), Math.round(event.clientY / zoom - offset.y));
        }

        // End moving shape
        function end(): void {
            slide.canvas.off("mousemove", preview);
            slide.canvas.off("mouseup", end);

            graphic.styleModel.x = svg.x();
            graphic.styleModel.y = svg.y();
            slide.$store.commit("styleEditorObject", undefined);
            slide.$store.commit("styleEditorObject", graphic);
        }
    },
    canvasMouseDown: (slide: any) => (): void => {
        if (slide.$store.getters.focusedGraphicId === "") {
            return;
        }

        slide.$store.commit("focusGraphic", { id: "" });
        slide.$store.commit("styleEditorObject", undefined);
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

        const points: Array<Point> = [getMousePosition(slide, event)];
        const shape: SVG.PolyLine = canvas.polyline(points.map<Array<number>>((point: Point) => [point.x, point.y]))
            .fill("none").stroke("black").attr("stroke-width", 3);

        function preview(event: MouseEvent): void {
            points.push(getMousePosition(slide, event));
            shape.plot(points.map<Array<number>>((point: Point) => [point.x, point.y]));
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
                    points: points
                })
            });

            shape.remove();
            slide.$store.commit("addGraphic", { slideId: slide.id, graphic });
            slide.$store.commit("styleEditorObject", graphic);
            slide.$store.commit("focusGraphic", graphic);
        }
    }
});

let active: boolean = false;
const penTool: ToolModel = new ToolModel("pen", {
    canvasMouseOver: (canvas: SVG.Doc) => (): any => canvas.style("cursor", "crosshair"),
    canvasMouseOut: (canvas: SVG.Doc) => (): any => canvas.style("cursor", "default"),
    canvasMouseDown: (slide: any, canvas: SVG.Doc) => (event: MouseEvent): void => {
        if (active) { return; }
        else { active = true; }

        event.stopPropagation();
        event.preventDefault();
        document.addEventListener("keydown", end);
        canvas.on("mousemove", preview);
        canvas.on("mouseup", setFirstControlPoint);

        const start: Point = getMousePosition(slide, event);
        const curves: Array<Array<Point>> = [[start]];
        let currentCurve: Array<Array<Point | undefined>> = [[start], [undefined, undefined, undefined]];
        const shape: SVG.Path = canvas.path(toBezierString(curves)).fill("none").stroke("black").attr("stroke-width", 3);
        const currentCurveShape: SVG.Path = canvas.path(toBezierString(resolveCurve(currentCurve, start))).fill("none").stroke("black").attr("stroke-width", 3);
        const controlPointShape: SVG.Line = canvas.line([start.toArray(), start.toArray()]).fill("none").stroke(slide.$store.getters.theme.information).remove();

        function setFirstControlPoint(event: MouseEvent): void {
            canvas.off("mouseup", setFirstControlPoint);
            canvas.on("mousedown", setEndpoint);

            currentCurve[1][0] = getMousePosition(slide, event);
        }

        function setEndpoint(event: MouseEvent): void {
            event.stopPropagation();
            event.preventDefault();
            canvas.off("mousedown", setEndpoint);
            canvas.on("mouseup", setSecondControlPoint);

            currentCurve[1][2] = getMousePosition(slide, event);
        }

        function setSecondControlPoint(event: MouseEvent): void {
            canvas.off("mouseup", setSecondControlPoint);

            currentCurve[1][1] = getMousePosition(slide, event).reflect(currentCurve[1][2]);
            curves.push(currentCurve[1] as Array<Point>);
            currentCurve = [[currentCurve[1][2]], [undefined, undefined, undefined]];
            setFirstControlPoint(event);
            controlPointShape.remove();
            shape.plot(toBezierString(curves));
        }

        function preview(event: MouseEvent): void {
            const position: Point = getMousePosition(slide, event);
            currentCurveShape.plot(toBezierString(resolveCurve(currentCurve, position)));

            // Draw the control point shape if the endpoint is defined
            if (currentCurve[1][2] !== undefined) {
                canvas.add(controlPointShape);
                controlPointShape.plot([position.reflect(currentCurve[1][2]).toArray(), position.toArray()]);
            }
        }

        function end(event: KeyboardEvent): void {
            // Check if the pressed key is not one of the specified keys to end the curve drawing
            if (["Escape", "Enter", "Tab"].indexOf(event.key) === -1) {
                return;
            }

            active = false;
            document.removeEventListener("keydown", end);
            canvas.off("mousemove", preview);

            // Flatten the representation of curves into a list of points
            // Remove the last curve because it will always have some undefned points
            const flattenedPoints: Array<Point | undefined> = [];
            curves.forEach((curve: Array<Point | undefined>) => flattenedPoints.push(...curve));

            const graphic = new GraphicModel({
                type: "curve",
                styleModel: new StyleModel({
                    fill: shape.attr("fill"),
                    stroke: shape.attr("stroke"),
                    strokeWidth: shape.attr("stroke-width"),
                    points: flattenedPoints as Array<Point>
                })
            });

            // Remove the shape visually, persist it to the slide, then refresh the style editor
            shape.remove();
            slide.$store.commit("addGraphic", { slideId: slide.id, graphic });
            slide.$store.commit("styleEditorObject", graphic);
            slide.$store.commit("focusGraphic", graphic);
        }

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
                .map<string>((curve: Array<Point>): string => `C ${curve.map<string>((point: Point) => `${point.x},${point.y}`).join(" ")}`)
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

        const start: Point = getMousePosition(slide, event);
        const shape: SVG.Rect = canvas.rect().move(start.x, start.y);

        // Preview drawing rectangle
        function preview(event: MouseEvent): void {
            const client: Point = getMousePosition(slide, event);
            const width: number = client.x - start.x;
            const height: number = client.y - start.y;

            // Check if shift is pressed to toggle between rectangle and square
            if (slide.$store.getters.pressedKeys[16]) {
                const sideLength = Math.min(Math.abs(width), Math.abs(height));
                shape.move(width < 0 ? start.x - sideLength : start.x, height < 0 ? start.y - sideLength : start.y);
                shape.size(sideLength, sideLength);
            } else {
                shape.move(width < 0 ? client.x : start.x, height < 0 ? client.y : start.y);
                shape.size(Math.sign(width) * width, Math.sign(height) * height);
            }
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

const textboxTool: ToolModel = new ToolModel("textbox", {
    canvasMouseOver: (canvas: SVG.Doc) => (): any => canvas.style("cursor", "text"),
    canvasMouseOut: (canvas: SVG.Doc) => (): any => canvas.style("cursor", "default"),
    canvasMouseDown: (slide: any) => (event: MouseEvent): void => {
        event.stopPropagation();
        event.preventDefault();

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
    textboxTool,
    generateId,
    objectToHtml,
    htmlToObject,
    deckScript
};

function generateId(): string {
    const s4 = () => Math.floor((Math.random() + 1) * 0x10000).toString(16).substring(1).toLocaleUpperCase();
    return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
}

function block(innerText: string): EditorBlockModel {
    return new EditorBlockModel({ content: innerText });
}

function space(): EditorBlockModel {
    return new EditorBlockModel({ style: { width: "7px" }});
}

function lineNumber(number: number): EditorBlockModel[] {
    const elements: EditorBlockModel[] = [];
    const padSize = 4 - number.toString().length;

    for (let i = 0; i < padSize; i++) {
        elements.push(space());
    }

    elements.push(block(number.toString()));
    elements.push(block("|"));
    elements.push(space());

    return elements;
}

// Wraps a collection of blocks into a line, complete with a line number
function line(number: number, indentDepth: number, elements: EditorBlockModel[]): EditorLineModel {
    const line: EditorLineModel = new EditorLineModel();

    // Add the line number, indent, then append elements
    lineNumber(number).forEach((element: EditorBlockModel) => line.addBlock(element));

    for (let i = 0; i < indentDepth * 2; i++) {
        line.addBlock(space());
    }

    elements.forEach((element: EditorBlockModel) => line.addBlock(element));

    return line;
}

function objectToHtml(object: any, lineCount: number, indentDepth: number): EditorLineModel[] {
    const lines: EditorLineModel[] = [];
    const actualPropertyCount = Object.keys(object).length - 1;
    let propertyCount = 0;

    for (const property in object) {
        // TODO: Block displaying points in a more robust fashion
        if (property === "points") {
            continue;
        }

        const value = object[property];

        if (typeof value === "number" || typeof value === "string" || typeof value === "boolean") {
            const elements: EditorBlockModel[] = [block(property), block(":"), space(), block(value.toString())];
            if (propertyCount < actualPropertyCount) {
                elements.push(block(","));
            }

            lines.push(line(lineCount, indentDepth, elements));
            lineCount++;
        } else if (typeof value === "object") {
            lines.push(line(lineCount, indentDepth, [block(property), block(":"), space(), block("{")]));
            lineCount++;

            // Recursively cast child objects to html
            const propertyLines: EditorLineModel[] = objectToHtml(value, lineCount, indentDepth + 1);
            propertyLines.forEach((line: EditorLineModel) => lines.push(line));
            lineCount += propertyLines.length;

            const elements = [block("}")];
            if (propertyCount < actualPropertyCount) {
                elements.push(block(","));
            }

            lines.push(line(lineCount, indentDepth, elements));
            lineCount++;
        }

        propertyCount++;
    }

    return lines;
}

function htmlToObject(lines: EditorLineModel[]): any {
    let objectString: string = "{";

    lines.forEach((line) => {
        // TODO: More robust ignorance of line numbers
        line.editorBlocks.slice(5).forEach((block) => {
            // TODO: More robust detection of properties that need quotes
            if (block.content === ":" || block.content === "{" || block.content === "}" || block.content === "" || block.content === ",") {
                objectString += block.content;
            } else {
                objectString += `"${block.content}"`;
            }
        });
    });

    objectString += "}";
    return JSON.parse(objectString);
}

function deckScript(): string {
    return `<style>
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
}
