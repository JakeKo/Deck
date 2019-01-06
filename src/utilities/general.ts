import Point from "../models/Point";
import IGraphic from "../models/IGraphic";
import Rectangle from "../models/Rectangle";
import Ellipse from "../models/Ellipse";
import Curve from "../models/Curve";
import Sketch from "../models/Sketch";
import Text from "../models/Text";

function toPrettyString(object: any, indentDepth: number): string {
    const properties: Array<string> = [];
    for (const property in object) {
        const value: any = object[property];
        const prefix: string = Array.isArray(object) ? space(indentDepth) : `${space(indentDepth)}"${property}": `;

        if (typeof value === "number" || typeof value === "boolean") {
            properties.push(`${prefix}${value}`);
        } else if (typeof value === "string") {
            properties.push(`${prefix}${JSON.stringify(value)}`);
        } else if (Array.isArray(value) || typeof value === "object") {
            properties.push(`${prefix}${toPrettyString(value, indentDepth + 1)}`);
        }
    }

    const prettyString: string = `\n${properties.join(",\n")}\n${space(indentDepth - 1)}`;
    return Array.isArray(object) ? `[${prettyString}]` : `{${prettyString}}`;

    function space(indentDepth: number): string {
        return new Array(indentDepth * 4).fill(" ").join("");
    }
}

function generateId(): string {
    function term(): string {
        return Math.floor((Math.random() + 1) * 0x10000).toString(16).substring(1).toLocaleUpperCase();
    }

    return `${term()}${term()}-${term()}-${term()}-${term()}-${term()}${term()}${term()}`;
}

// Overrides the default behavior of copy to copy the graphic model of the focused graphic
function copyHandler(app: any): (event: Event) => void {
    return function (event: Event): void {
        // Cast event as clipboard event and prevent from copying any user selection
        const clipboardEvent: ClipboardEvent = event as ClipboardEvent;
        clipboardEvent.preventDefault();

        const focusedGraphicId: string | undefined = app.$store.getters.focusedGraphicId;
        if (focusedGraphicId === undefined) {
            return;
        }

        // Set the clipboard data to the graphic model associated with the current focused graphic
        const graphic: IGraphic = app.$store.getters.activeSlide.graphics.find((graphic: IGraphic) => graphic.id === focusedGraphicId)!;
        clipboardEvent.clipboardData.setData("text/json", JSON.stringify(graphic));
    };
}

// Override the default behavior of the paste to paste the copied graphic model
function pasteHandler(app: any): (event: Event) => void {
    return function (event: Event): void {
        // Cast event as clipboard event
        const clipboardEvent: ClipboardEvent = event as ClipboardEvent;
        clipboardEvent.preventDefault();

        const data: any = JSON.parse(clipboardEvent.clipboardData.getData("text/json"));
        if (data === undefined) {
            return;
        }

        const graphic: IGraphic = parseGraphic(data);
        graphic.id = generateId();
        app.$store.commit("addGraphic", { slideId: app.$store.getters.activeSlide.id, graphic: graphic });
        app.$store.commit("focusGraphic", graphic);
        app.$store.commit("styleEditorObject", graphic);
    };
}

function parseGraphic(json: any): IGraphic {
    if (json.id !== undefined && json.origin !== undefined && json.width !== undefined &&
        json.height !== undefined && json.fillColor !== undefined && json.strokeColor !== undefined &&
        json.strokeWidth !== undefined && json.rotation !== undefined) {
        json.origin = new Point(json.origin.x, json.origin.y);
        const rectangle: Rectangle = new Rectangle(json);
        return rectangle;
    } else if (json.id !== undefined && json.center !== undefined && json.width !== undefined &&
        json.height !== undefined && json.fillColor !== undefined && json.strokeColor !== undefined &&
        json.strokeWidth !== undefined && json.rotation !== undefined) {
        json.center = new Point(json.center.x, json.center.y);
        const ellipse: Ellipse = new Ellipse(json);
        return ellipse;
    } else if (json.id !== undefined && json.points !== undefined && json.fillColor !== undefined &&
        json.strokeColor !== undefined && json.strokeWidth !== undefined && json.rotation !== undefined &&
        json.degree !== undefined) {
        json.points = json.points.map((point: { x: number, y: number }): Point => new Point(point.x, point.y));
        const curve: Curve = new Curve(json);
        return curve;
    } else if (json.id !== undefined && json.points !== undefined && json.fillColor !== undefined &&
        json.strokeColor !== undefined && json.strokeWidth !== undefined && json.rotation !== undefined) {
        json.points = json.points.map((point: { x: number, y: number }): Point => new Point(point.x, point.y));
        const sketch: Sketch = new Sketch(json);
        return sketch;
    } else if (json.id !== undefined && json.origin !== undefined && json.content !== undefined &&
        json.fontSize !== undefined && json.fontWeight !== undefined && json.fontFamily !== undefined &&
        json.fillColor !== undefined && json.rotation !== undefined) {
        json.origin = new Point(json.origin.x, json.origin.y);
        const text: Text = new Text(json);
        return text;
    }

    throw `Undefined graphic ${json}`;
}

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
    toPrettyString,
    generateId,
    copyHandler,
    pasteHandler,
    parseGraphic,
    deckScript
};
