import Vector from "../models/Vector";
import IGraphic from "../models/graphics/IGraphic";
import Rectangle from "../models/graphics/Rectangle";
import Ellipse from "../models/graphics/Ellipse";
import Curve from "../models/graphics/Curve";
import Sketch from "../models/graphics/Sketch";
import Text from "../models/graphics/Text";
import Image from "../models/graphics/Image";
import Video from "../models/graphics/Video";
import SlideWrapper from "./SlideWrapper";
import GraphicMouseEvent from "../models/GraphicMouseEvent";
import CanvasMouseEvent from "../models/CanvasMouseEvent";
import IRectangularGraphic from "../models/graphics/IRectangularGraphic";

function generateId(): string {
    function term(): string {
        return Math.floor((Math.random() + 1) * 0x10000).toString(16).substring(1).toLocaleUpperCase();
    }

    return `${term()}${term()}-${term()}-${term()}-${term()}-${term()}${term()}${term()}`;
}

function getPosition(event: CustomEvent<GraphicMouseEvent | CanvasMouseEvent>, slideWrapper: SlideWrapper): Vector {
    const zoom: number = slideWrapper.store.getters.canvasZoom;
    const resolution: number = slideWrapper.store.getters.canvasResolution;
    const bounds: DOMRect = slideWrapper.absoluteBounds();

    return new Vector(
        Math.round(((event.detail.baseEvent.pageX - bounds.x) / zoom) * resolution),
        Math.round(((event.detail.baseEvent.pageY - bounds.y) / zoom) * resolution)
    );
}

function parseGraphic(json: any): IGraphic {
    if (json.type === "rectangle") {
        json.origin = new Vector(json.origin.x, json.origin.y);
        return new Rectangle(json);
    } else if (json.type === "ellipse") {
        json.origin = new Vector(json.origin.x, json.origin.y);
        return new Ellipse(json);
    } else if (json.type === "curve") {
        json.origin = new Vector(json.origin.x, json.origin.y);
        json.points = json.points.map((point: { x: number, y: number }): Vector => new Vector(point.x, point.y));
        return new Curve(json);
    } else if (json.type === "sketch") {
        json.origin = new Vector(json.origin.x, json.origin.y);
        json.points = json.points.map((point: { x: number, y: number }): Vector => new Vector(point.x, point.y));
        return new Sketch(json);
    } else if (json.type === "text") {
        json.origin = new Vector(json.origin.x, json.origin.y);
        return new Text(json);
    } else if (json.type === "image") {
        json.origin = new Vector(json.origin.x, json.origin.y);
        return new Image(json);
    } else if (json.type === "video") {
        json.origin = new Vector(json.origin.x, json.origin.y);
        return new Video(json);
    }

    throw `Undefined graphic type: ${json.type}`;
}

function makeAnchorGraphic(id: string, origin: Vector): Ellipse {
    const radius: number = 4;

    return new Ellipse({
        id: id,
        defaultInteractive: false,
        supplementary: true,
        origin: origin.add(new Vector(-radius, -radius)),
        height: radius * 2,
        width: radius * 2,
        fillColor: "white",
        strokeColor: "hotpink",
        strokeWidth: 2
    });
}

function adjustUpperLeftAnchor(position: Vector, graphic: IRectangularGraphic) {
    const adjustment: Vector = graphic.origin.towards(position);
    graphic.origin = position;
    graphic.width -= adjustment.x;
    graphic.height -= adjustment.y;
}

function adjustUpperRightAnchor(position: Vector, graphic: IRectangularGraphic) {
    const adjustment: Vector = graphic.origin.add(new Vector(graphic.width, 0)).towards(position);
    graphic.origin.y += adjustment.y;
    graphic.width += adjustment.x;
}

function adjustLowerRightAnchor(position: Vector, graphic: IRectangularGraphic) {
    const adjustment: Vector = graphic.origin.add(new Vector(graphic.width, graphic.height)).towards(position);
    graphic.width += adjustment.x;
    graphic.height += adjustment.y;
}

function adjustLowerLeftAnchor(position: Vector, graphic: IRectangularGraphic) {
    const adjustment: Vector = graphic.origin.add(new Vector(0, graphic.height)).towards(position);
    graphic.origin.x += adjustment.x;
    graphic.height += adjustment.y;
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
    makeAnchorGraphic,
    adjustUpperLeftAnchor,
    adjustUpperRightAnchor,
    adjustLowerRightAnchor,
    adjustLowerLeftAnchor,
    deckScript
};
