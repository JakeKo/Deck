import Point from "../models/Point";
import IGraphic from "../models/IGraphic";
import Rectangle from "../models/Rectangle";
import Ellipse from "../models/Ellipse";
import Curve from "../models/Curve";
import Sketch from "../models/Sketch";
import Text from "../models/Text";

function generateId(): string {
    function term(): string {
        return Math.floor((Math.random() + 1) * 0x10000).toString(16).substring(1).toLocaleUpperCase();
    }

    return `${term()}${term()}-${term()}-${term()}-${term()}-${term()}${term()}${term()}`;
}

function parseGraphic(json: any): IGraphic {
    if (json.origin !== undefined && json.width !== undefined &&
        json.height !== undefined && json.fillColor !== undefined && json.strokeColor !== undefined &&
        json.strokeWidth !== undefined && json.rotation !== undefined) {
        json.origin = new Point(json.origin.x, json.origin.y);
        const rectangle: Rectangle = new Rectangle(json);
        return rectangle;
    } else if (json.center !== undefined && json.width !== undefined &&
        json.height !== undefined && json.fillColor !== undefined && json.strokeColor !== undefined &&
        json.strokeWidth !== undefined && json.rotation !== undefined) {
        json.center = new Point(json.center.x, json.center.y);
        const ellipse: Ellipse = new Ellipse(json);
        return ellipse;
    } else if (json.points !== undefined && json.fillColor !== undefined &&
        json.strokeColor !== undefined && json.strokeWidth !== undefined && json.rotation !== undefined &&
        json.degree !== undefined) {
        json.points = json.points.map((point: { x: number, y: number }): Point => new Point(point.x, point.y));
        const curve: Curve = new Curve(json);
        return curve;
    } else if (json.points !== undefined && json.fillColor !== undefined &&
        json.strokeColor !== undefined && json.strokeWidth !== undefined && json.rotation !== undefined) {
        json.points = json.points.map((point: { x: number, y: number }): Point => new Point(point.x, point.y));
        const sketch: Sketch = new Sketch(json);
        return sketch;
    } else if (json.origin !== undefined && json.content !== undefined &&
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
    generateId,
    parseGraphic,
    deckScript
};
