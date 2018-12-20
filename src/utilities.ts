import * as SVG from "svg.js";
import Point from "./models/Point";
import GraphicModel from "./models/GraphicModel";
import StyleModel from "./models/StyleModel";

const toPrettyString: (object: any, indentDepth: number) => string = (object: any, indentDepth: number): string => {
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
    toPrettyString,
    renderGraphic,
    generateId,
    deckScript
};
