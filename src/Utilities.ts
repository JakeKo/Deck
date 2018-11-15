import EditorLineModel from "./models/EditorLineModel";
import EditorBlockModel from "./models/EditorBlockModel";
import SlideModel from "./models/SlideModel";
import * as SVG from "svg.js";
import Point from "./models/Point";
import GrahpicModel from "./models/GraphicModel";

export default {
    generateId,
    cursorHandlers,
    rectangleHandlers,
    objectToHtml,
    htmlToObject,
    getSlide,
    deckScript
};

function generateId(): string {
    const s4 = () => Math.floor((Math.random() + 1) * 0x10000).toString(16).substring(1).toLocaleUpperCase();
    return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
}

function cursorHandlers(canvas: SVG.Doc, store: any, svg: SVG.Element, graphic: GrahpicModel): any {
    return {
        onMouseOver,
        onMouseOut,
        onMouseDown
    };

    function onMouseOver(): void {
        svg.style("cursor", "pointer");
    }

    function onMouseOut(): void {
        svg.style("cursor", "default");
    }

    function onMouseDown(event: MouseEvent): void {
        console.log("cursor");
        store.commit("styleEditorObject", graphic);
        const offset = new Point(event.clientX - svg.attr("x"), event.clientY - svg.attr("y"));
        canvas.on("mousemove", previewMoveGraphic);
        canvas.on("mouseup", endMoveGrahpic);

        // Preview moving shape
        function previewMoveGraphic(event: MouseEvent): void {
            svg.move(event.clientX - offset.x, event.clientY - offset.y);
        }

        // End moving shape
        function endMoveGrahpic(this: SVG.Element): void {
            canvas.off("mousemove", previewMoveGraphic);
            canvas.off("mouseup", endMoveGrahpic);
        }
    }
}

function rectangleHandlers(canvas: SVG.Doc, store: any, svg: SVG.Element, graphic: GrahpicModel): any {
    return {
        onMouseDown
    };

    function onMouseDown(event: MouseEvent): void {
        console.log("rectangle");
        store.commit("styleEditorObject", graphic);
        const offset = new Point(event.clientX - svg.attr("x"), event.clientY - svg.attr("y"));
        canvas.on("mousemove", previewMoveGraphic);
        canvas.on("mouseup", endMoveGrahpic);

        // Preview moving shape
        function previewMoveGraphic(event: MouseEvent): void {
            svg.move(event.clientX - offset.x, event.clientY - offset.y);
        }

        // End moving shape
        function endMoveGrahpic(this: SVG.Element): void {
            canvas.off("mousemove", previewMoveGraphic);
            canvas.off("mouseup", endMoveGrahpic);
        }
    }
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
