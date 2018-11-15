import EditorLineModel from "./models/EditorLineModel";
import EditorBlockModel from "./models/EditorBlockModel";
import SlideModel from "./models/SlideModel";
import * as SVG from "svg.js";
import Point from "./models/Point";
import GraphicModel from "./models/GraphicModel";
import ToolModel from "./models/ToolModel";

// Cursor Tool handlers
const cursorTool: ToolModel = new ToolModel("cursor", {
    graphicMouseOver: (svg: SVG.Element) => (): any => svg.style("cursor", "pointer"),
    graphicMouseOut: (svg: SVG.Element) => (): any => svg.style("cursor", "default"),
    graphicMouseDown: (slide: any, svg: SVG.Element, graphic: GraphicModel) => (event: MouseEvent): any => {
        slide.$store.commit("styleEditorObject", graphic);
        const offset = new Point(event.clientX - svg.x(), event.clientY - svg.y());
        slide.canvas.on("mousemove", preview);
        slide.canvas.on("mouseup", end);

        // Preview moving shape
        function preview(event: MouseEvent): void {
            svg.move(event.clientX - offset.x, event.clientY - offset.y);
        }

        // End moving shape
        function end(): void {
            slide.canvas.off("mousemove", preview);
            slide.canvas.off("mouseup", end);
        }
    }
});

const rectangleTool: ToolModel = new ToolModel("rectangle", {
    canvasMouseDown: (slide: any, canvas: SVG.Doc) => (event: MouseEvent) => {
        const bounds: DOMRect = slide.$el.getBoundingClientRect();
        const shape: SVG.Element = canvas.rect(0, 0);
        const start: Point = new Point(event.clientX - bounds.left, event.clientY - bounds.top);
        shape.move(start.x, start.y);
        canvas.on("mousemove", preview);
        canvas.on("mouseup", end);

        // Preview drawing rectangle
        function preview(event: MouseEvent): void {
            const client: Point = new Point(event.clientX - bounds.left, event.clientY - bounds.top);
            const width: number = client.x - start.x;
            const height: number = client.y - start.y;

            if (width < 0) {
                shape.x(client.x);
            }

            if (height < 0) {
                shape.y(client.y);
            }

            shape.width(Math.sign(width) * width);
            shape.height(Math.sign(height) * height);
        }

        // End drawing rectangle
        function end(): void {
            canvas.off("mousemove", preview);
            canvas.off("mouseup", end);
        }
    }
});

export default {
    cursorTool,
    rectangleTool,
    generateId,
    objectToHtml,
    htmlToObject,
    getSlide,
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

function getSlide(slides: SlideModel[], slideId: string): SlideModel | undefined {
    return slides.find((slide) => slide.id === slideId);
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
