import Point from "../models/Vector";
import IGraphic from "../models/graphics/IGraphic";
import Rectangle from "../models/graphics/Rectangle";
import Ellipse from "../models/graphics/Ellipse";
import Curve from "../models/graphics/Curve";
import Sketch from "../models/graphics/Sketch";
import Text from "../models/graphics/Text";
import Image from "../models/graphics/Image";
import Video from "../models/graphics/Video";
import SlideWrapper from "./SlideWrapper";

function generateId(): string {
    function term(): string {
        return Math.floor((Math.random() + 1) * 0x10000).toString(16).substring(1).toLocaleUpperCase();
    }

    return `${term()}${term()}-${term()}-${term()}-${term()}-${term()}${term()}${term()}`;
}

function getPosition(event: CustomEvent, slideWrapper: SlideWrapper): Point {
    const mouseEvent: MouseEvent = event.detail.baseEvent as MouseEvent;
    const zoom: number = slideWrapper.store.getters.canvasZoom;
    const resolution: number = slideWrapper.store.getters.canvasResolution;
    const bounds: DOMRect = slideWrapper.absoluteBounds();
    return new Point(Math.round(((mouseEvent.pageX - bounds.x) / zoom) * resolution), Math.round(((mouseEvent.pageY - bounds.y) / zoom) * resolution));
}

function parseGraphic(json: any): IGraphic {
    if (json.type === "rectangle") {
        json.origin = new Point(json.origin.x, json.origin.y);
        return new Rectangle(json);
    } else if (json.type === "ellipse") {
        json.origin = new Point(json.origin.x, json.origin.y);
        return new Ellipse(json);
    } else if (json.type === "curve") {
        json.origin = new Point(json.origin.x, json.origin.y);
        json.points = json.points.map((point: { x: number, y: number }): Point => new Point(point.x, point.y));
        return new Curve(json);
    } else if (json.type === "sketch") {
        json.origin = new Point(json.origin.x, json.origin.y);
        json.points = json.points.map((point: { x: number, y: number }): Point => new Point(point.x, point.y));
        return new Sketch(json);
    } else if (json.type === "text") {
        json.origin = new Point(json.origin.x, json.origin.y);
        return new Text(json);
    } else if (json.type === "image") {
        json.origin = new Point(json.origin.x, json.origin.y);
        return new Image(json);
    } else if (json.type === "video") {
        json.origin = new Point(json.origin.x, json.origin.y);
        return new Video(json);
    }

    throw `Undefined graphic type: ${json.type}`;
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
    getPosition,
    parseGraphic,
    deckScript
};
