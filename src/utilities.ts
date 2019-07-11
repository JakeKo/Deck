import Vector from "./models/Vector";
import SnapVector from "./models/SnapVector";
import { IGraphic, Snap } from "./types";
import { Rectangle, Ellipse, Curve, Sketch, Text, Image, Video } from "./models/graphics/graphics";

function generateId(): string {
    function term(): string {
        return Math.floor((Math.random() + 1) * 0x10000).toString(16).substring(1).toLocaleUpperCase();
    }

    return `${term()}${term()}-${term()}-${term()}-${term()}-${term()}${term()}${term()}`;
}

function parseGraphic(data: any): IGraphic {
    if (data.type === "rectangle") {
        data.origin = new Vector(data.origin.x, data.origin.y);
        return new Rectangle(data);
    } else if (data.type === "ellipse") {
        data.origin = new Vector(data.origin.x, data.origin.y);
        return new Ellipse(data);
    } else if (data.type === "curve") {
        data.origin = new Vector(data.origin.x, data.origin.y);
        return new Curve(data);
    } else if (data.type === "sketch") {
        data.origin = new Vector(data.origin.x, data.origin.y);
        return new Sketch(data);
    } else if (data.type === "text") {
        data.origin = new Vector(data.origin.x, data.origin.y);
        return new Text(data);
    } else if (data.type === "image") {
        data.origin = new Vector(data.origin.x, data.origin.y);
        return new Image(data);
    } else if (data.type === "video") {
        data.origin = new Vector(data.origin.x, data.origin.y);
        return new Video(data);
    }

    throw `Undefined graphic type: ${data.type}`;
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

function toPrettyString(object: any, indentDepth: number = 1): string {
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

function getClosestSnap(snaps: Array<Snap>): Snap | undefined {
    if (snaps.length === 0) {
        return;
    }

    let closestSnap: Snap = snaps[0];
    snaps.forEach((snap: Snap): void => {
        if (getTranslation(snap).magnitude < getTranslation(closestSnap).magnitude) {
            closestSnap = snap;
        }
    });

    return closestSnap;
}

function getTranslation(snap: Snap): Vector {
    return snap.source.towards(snap.destination.getClosestPoint(snap.source));
}

function getSnaps(snapVectors: Array<SnapVector>, snappableVectors: Array<Vector>): Array<Snap> {
    const snaps: Array<Snap> = [];

    // List all combinations of snap and snappable vectors
    snapVectors.forEach((snapVector: SnapVector): void => {
        snappableVectors.forEach((snappableVector: Vector): void => {
            snaps.push({ source: snappableVector, destination: snapVector });
        });
    });

    // Filter by all snap translations within some epsilon and finish if there are no close translations
    const closeSnaps: Array<Snap> = snaps.filter((snap: Snap): boolean => getTranslation(snap).magnitude < 10);
    const mainSnap: Snap | undefined = getClosestSnap(closeSnaps);

    if (mainSnap === undefined) {
        return [];
    }

    // Find all translations that could also be performed without interfering with the main translation (i.e. the vectors are orthogonal)
    const compatibleSnaps: Array<Snap> = closeSnaps.filter((snap: Snap): boolean => getTranslation(snap).dot(getTranslation(mainSnap)) === 0);
    const compatibleSnap: Snap | undefined = getClosestSnap(compatibleSnaps);

    return compatibleSnap === undefined ? [mainSnap] : [mainSnap, compatibleSnap];
}

function getStrictProjectionVector(movement: Vector) {
    // Calculate the angle by which the graphic is being moved
    const angle: number = movement.theta(Vector.right);
    return Math.PI / 4 <= angle && angle < Math.PI * 3 / 4 ? Vector.up : Vector.right;
}

function makeBezierCurvePointGraphic(origin: Vector, firstAnchor: Vector, secondAnchor: Vector): Array<IGraphic> {
    // NOTE: The order of graphics matters here so the line is rendered below the anchor graphics
    return [
        new Sketch({
            supplementary: true,
            defaultInteractive: false,
            points: [ firstAnchor, secondAnchor ],
            strokeColor: "hotpink",
            strokeWidth: 2
        }),
        new Rectangle({
            supplementary: true,
            defaultInteractive: false,
            origin: firstAnchor.add(new Vector(-3, -3)),
            width: 6,
            height: 6,
            strokeColor: "hotpink",
            strokeWidth: 2,
            fillColor: "white"
        }),
        makeAnchorGraphic(generateId(), origin),
        new Rectangle({
            supplementary: true,
            defaultInteractive: false,
            origin: secondAnchor.add(new Vector(-3, -3)),
            width: 6,
            height: 6,
            strokeColor: "hotpink",
            strokeWidth: 2,
            fillColor: "white"
        })
    ];
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
    makeAnchorGraphic,
    toPrettyString,
    getStrictProjectionVector,
    getSnaps,
    getTranslation,
    makeBezierCurvePointGraphic,
    deckScript
};
