import EditorLineModel from "./models/EditorLineModel";
import EditorBlockModel from "./models/EditorBlockModel";
import * as SVG from "svg.js";
import Point from "./models/Point";
import GraphicModel from "./models/GraphicModel";
import ToolModel from "./models/ToolModel";
import StyleModel from "./models/StyleModel";

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
        if (slide.$store.getters.focusedGraphicId !== "") {
            slide.$store.commit("focusGraphic", { id: "" });
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

        let zoom: number = slide.$store.getters.canvasZoom;
        const bounds: DOMRect = slide.$el.getBoundingClientRect();
        const points: Array<Array<number>> = [[Math.round(event.clientX / zoom - bounds.left), Math.round(event.clientY / zoom - bounds.top)]];
        const shape: SVG.PolyLine = canvas.polyline(points).fill("none").stroke("black").attr("stroke-width", 3);

        function preview(event: MouseEvent): void {
            zoom = slide.$store.getters.canvasZoom;
            points.push([Math.round(event.clientX / zoom - bounds.left), Math.round(event.clientY / zoom - bounds.top)]);
            shape.plot(points);
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
                    points: points.map((point: Array<number>) => new Point(point[0], point[1]))
                })
            });

            shape.remove();
            slide.$store.commit("addGraphic", { slideId: slide.id, graphic });
            slide.$store.commit("styleEditorObject", graphic);
            slide.$store.commit("focusGraphic", graphic);
        }
    }
});

const penTool: ToolModel = new ToolModel("pen", {
    canvasMouseOver: (canvas: SVG.Doc) => (): any => canvas.style("cursor", "crosshair"),
    canvasMouseOut: (canvas: SVG.Doc) => (): any => canvas.style("cursor", "default"),
    canvasMouseDown: (slide: any, canvas: SVG.Doc) => (event: MouseEvent): void => {
        event.stopPropagation();
        event.preventDefault();
        canvas.off("mousemove");
        canvas.on("mousemove", preview);
        canvas.off("mouseup");
        canvas.on("mouseup", setFirstControlPoint);

        let zoom: number = slide.$store.getters.canvasZoom;
        const bounds: DOMRect = slide.$el.getBoundingClientRect();
        const start: Point = new Point(Math.round(event.clientX / zoom - bounds.left), Math.round(event.clientY / zoom - bounds.top));
        const shape: SVG.Path = canvas.path(toBezierString([[start]])).fill("none").stroke("black").attr("stroke-width", 3);

        let currentCurve: Array<Point | undefined>;
        const curves: Array<Array<Point | undefined>> = [[start]];
        startNewCurve();

        function startNewCurve(): void {
            currentCurve = [undefined, undefined, undefined];
            curves.push(currentCurve);
        }

        function setFirstControlPoint(event: MouseEvent): void {
            canvas.off("mouseup", setFirstControlPoint);
            canvas.off("mousedown");
            canvas.on("mousedown", setEndpoint);
            console.log("setFirstControlPoint");

            zoom = slide.$store.getters.canvasZoom;
            currentCurve[0] = new Point(Math.round(event.clientX / zoom - bounds.left), Math.round(event.clientY / zoom - bounds.top));
        }

        function setEndpoint(event: MouseEvent): void {
            canvas.off("mousedown", setEndpoint);
            canvas.off("mouseup");
            canvas.on("mouseup", setSecondControlPoint);
            console.log("setEndpoint");

            zoom = slide.$store.getters.canvasZoom;
            currentCurve[2] = new Point(Math.round(event.clientX / zoom - bounds.left), Math.round(event.clientY / zoom - bounds.top));
        }

        function setSecondControlPoint(event: MouseEvent): void {
            canvas.off("mouseup", setSecondControlPoint);
            console.log("setSecondControlPoint");

            zoom = slide.$store.getters.canvasZoom;
            const position: Point = new Point(Math.round(event.clientX / zoom - bounds.left), Math.round(event.clientY / zoom - bounds.top));
            currentCurve[1] = new Point(currentCurve[2]!.x * 2 - position.x, currentCurve[2]!.y * 2 - position.y);
            startNewCurve();
            setFirstControlPoint(event);
        }

        function preview(event: MouseEvent): void {
            zoom = slide.$store.getters.canvasZoom;
            const position: Point = new Point(Math.round(event.clientX / zoom - bounds.left), Math.round(event.clientY / zoom - bounds.top));

            // Replace all undefined points with the current mouse position
            const resolvedCurves: Array<Array<Point>> = curves.map<Array<Point>>((curve: Array<Point | undefined>) =>
                [
                    curve[0] || position,
                    curve[1] || (curve[2] ? new Point(curve[2]!.x * 2 - position.x, curve[2]!.y * 2 - position.y) : position),
                    curve[2] || position
                ]
            );

            shape.plot(toBezierString(resolvedCurves));
        }

        function end(): void {
            canvas.off("mousemove", preview);
            canvas.off("mouseup", end);

            const graphic = new GraphicModel({
                type: "polyline",
                styleModel: new StyleModel({
                    fill: shape.attr("fill"),
                    stroke: shape.attr("stroke"),
                    strokeWidth: shape.attr("stroke-width")
                })
            });

            shape.remove();
            slide.$store.commit("addGraphic", { slideId: slide.id, graphic });
            slide.$store.commit("styleEditorObject", graphic);
            slide.$store.commit("focusGraphic", graphic);
        }

        function toBezierString(curves: Array<Array<Point>>): string {
            let bezierString = `M ${curves[0][0].x},${curves[0][0].y}`;

            for (let i = 1; i < curves.length; i++) {
                const curve: Array<Point> = curves[i];
                bezierString += " C";
                curve.forEach((point: Point) => bezierString += ` ${point.x},${point.y}`);
            }

            return bezierString;
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

        let zoom: number = slide.$store.getters.canvasZoom;
        const bounds: DOMRect = slide.$el.getBoundingClientRect();
        const start: Point = new Point(Math.round(event.clientX / zoom - bounds.left), Math.round(event.clientY / zoom - bounds.top));
        const shape: SVG.Rect = canvas.rect().move(start.x, start.y);

        // Preview drawing rectangle
        function preview(event: MouseEvent): void {
            zoom = slide.$store.getters.canvasZoom;
            const client: Point = new Point(Math.round(event.clientX / zoom - bounds.left), Math.round(event.clientY / zoom - bounds.top));
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

        const bounds: DOMRect = slide.$el.getBoundingClientRect();
        const zoom: number = slide.$store.getters.canvasZoom;
        const graphic = new GraphicModel({
            type: "textbox",
            styleModel: new StyleModel({
                x: Math.round(event.clientX / zoom - bounds.left),
                y: Math.round(event.clientY / zoom - bounds.top),
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
