import Vector from './models/Vector';
import SnapVector from './models/SnapVector';
import { IGraphic, Snap, BezierAnchorGraphics, ISlideWrapper, Anchor, CustomMouseEvent, CanvasMouseEvent, CustomGraphicMouseEvent, CustomCanvasMouseEvent, CustomCanvasKeyboardEvent } from './types';
import { Rectangle, Ellipse, Curve, Sketch, Text, Image, Video } from './models/graphics/graphics';
import { EVENT_TYPES } from './constants';

function generateId(): string {
    function term(): string {
        return Math.floor((Math.random() + 1) * 0x10000).toString(16).substring(1).toLocaleUpperCase();
    }

    return `${term()}${term()}-${term()}-${term()}-${term()}-${term()}${term()}${term()}`;
}

function parseGraphic(data: any): IGraphic {
    if (data.type === 'rectangle') {
        data.origin = new Vector(data.origin.x, data.origin.y);
        return new Rectangle(data);
    } else if (data.type === 'ellipse') {
        data.origin = new Vector(data.origin.x, data.origin.y);
        return new Ellipse(data);
    } else if (data.type === 'curve') {
        data.origin = new Vector(data.origin.x, data.origin.y);
        return new Curve(data);
    } else if (data.type === 'sketch') {
        data.origin = new Vector(data.origin.x, data.origin.y);
        return new Sketch(data);
    } else if (data.type === 'text') {
        data.origin = new Vector(data.origin.x, data.origin.y);
        return new Text(data);
    } else if (data.type === 'image') {
        data.origin = new Vector(data.origin.x, data.origin.y);
        return new Image(data);
    } else if (data.type === 'video') {
        data.origin = new Vector(data.origin.x, data.origin.y);
        return new Video(data);
    }

    throw `Undefined graphic type: ${data.type}`;
}

function makeAnchorGraphic(id: string, origin: Vector): Ellipse {
    return new Ellipse({
        id: id,
        defaultInteractive: false,
        supplementary: true,
        origin: origin.add(new Vector(-4, -4)),
        height: 8,
        width: 8,
        fillColor: 'white',
        strokeColor: 'hotpink',
        strokeWidth: 2
    });
}

function toPrettyString(object: any, indentDepth: number = 1): string {
    const properties: Array<string> = [];
    for (const property in object) {
        const value: any = object[property];
        const prefix: string = Array.isArray(object) ? space(indentDepth) : `${space(indentDepth)}"${property}": `;

        if (typeof value === 'number' || typeof value === 'boolean') {
            properties.push(`${prefix}${value}`);
        } else if (typeof value === 'string') {
            properties.push(`${prefix}${JSON.stringify(value)}`);
        } else if (Array.isArray(value) || typeof value === 'object') {
            properties.push(`${prefix}${toPrettyString(value, indentDepth + 1)}`);
        }
    }

    const prettyString: string = `\n${properties.join(',\n')}\n${space(indentDepth - 1)}`;
    return Array.isArray(object) ? `[${prettyString}]` : `{${prettyString}}`;

    function space(indentDepth: number): string {
        return new Array(indentDepth * 4).fill(' ').join('');
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

function makeBezierCurvePointGraphic({ anchor, firstHandle, secondHandle }: { anchor: Vector, firstHandle: Vector, secondHandle?: Vector }): BezierAnchorGraphics {
    const graphics: BezierAnchorGraphics = {
        anchor: makeAnchorGraphic(generateId(), anchor),
        firstHandle: new Rectangle({
            supplementary: true,
            defaultInteractive: false,
            origin: firstHandle.add(new Vector(-3, -3)),
            width: 6,
            height: 6,
            strokeColor: 'hotpink',
            strokeWidth: 2,
            fillColor: 'white'
        }),
        firstHandleTrace: new Sketch({
            supplementary: true,
            defaultInteractive: false,
            points: [firstHandle, anchor],
            strokeColor: 'hotpink',
            strokeWidth: 2
        })
    };

    if (secondHandle !== undefined) {
        graphics.secondHandle = new Rectangle({
            supplementary: true,
            defaultInteractive: false,
            origin: secondHandle.add(new Vector(-3, -3)),
            width: 6,
            height: 6,
            strokeColor: 'hotpink',
            strokeWidth: 2,
            fillColor: 'white'
        });

        graphics.secondHandleTrace = new Sketch({
            supplementary: true,
            defaultInteractive: false,
            points: [secondHandle, anchor],
            strokeColor: 'hotpink',
            strokeWidth: 2
        });
    }

    return graphics;
}

function bindAnchorMouseDown(slideWrapper: ISlideWrapper, anchor: Anchor, parentGraphic: IGraphic): void {
    slideWrapper.addGraphicEventListener(anchor.graphic.id, EVENT_TYPES.GRAPHIC_MOUSE_DOWN, ((event: CustomGraphicMouseEvent): void => {
        slideWrapper.addCanvasEventListener(EVENT_TYPES.CANVAS_MOUSE_MOVE, preview);
        slideWrapper.addCanvasEventListener(EVENT_TYPES.CANVAS_MOUSE_UP, end);
        slideWrapper.addCanvasEventListener(EVENT_TYPES.CANVAS_KEY_DOWN, toggleSquare);
        slideWrapper.addCanvasEventListener(EVENT_TYPES.CANVAS_KEY_UP, toggleSquare);

        parentGraphic.anchorIds.forEach((anchorId: string): void => slideWrapper.removeGraphic(anchorId));
        let lastPosition: Vector = new Vector(event.detail.baseEvent.clientX, event.detail.baseEvent.clientY);
        let shiftPressed = false;

        function preview(event: CustomCanvasMouseEvent): void {
            lastPosition = new Vector(event.detail.baseEvent.clientX, event.detail.baseEvent.clientY);
            anchor.handler(event);
            parentGraphic.updateRendering(slideWrapper.getGraphic(parentGraphic.id));
        }

        function end(): void {
            slideWrapper.removeCanvasEventListener(EVENT_TYPES.CANVAS_MOUSE_MOVE, preview);
            slideWrapper.removeCanvasEventListener(EVENT_TYPES.CANVAS_MOUSE_UP, end);
            slideWrapper.removeCanvasEventListener(EVENT_TYPES.CANVAS_KEY_DOWN, toggleSquare);
            slideWrapper.removeCanvasEventListener(EVENT_TYPES.CANVAS_KEY_UP, toggleSquare);

            slideWrapper.store.commit('removeSnapVectors', { slideId: slideWrapper.slideId, graphicId: parentGraphic.id });
            slideWrapper.store.commit('addSnapVectors', { slideId: slideWrapper.slideId, snapVectors: parentGraphic.getSnapVectors() });
            slideWrapper.store.commit('focusGraphic', { slideId: slideWrapper.slideId, graphicId: parentGraphic.id });
            slideWrapper.store.commit('updateGraphic', { slideId: slideWrapper.slideId, graphicId: parentGraphic.id, graphic: parentGraphic });
        }

        function toggleSquare(event: CustomCanvasKeyboardEvent): void {
            if (event.detail.baseEvent.key !== 'Shift' || (event.detail.baseEvent.type === 'keydown' && shiftPressed)) {
                return;
            }

            shiftPressed = event.detail.baseEvent.type === 'keydown';
            slideWrapper.dispatchEventOnCanvas(EVENT_TYPES.CANVAS_MOUSE_MOVE, {
                baseEvent: new MouseEvent('mousemove', {
                    shiftKey: event.type === 'keydown',
                    clientX: lastPosition.x,
                    clientY: lastPosition.y
                }),
                slideId: slideWrapper.slideId
            });
        }
    }));
}

function defaultCursorHandler(slideWrapper: ISlideWrapper): (event: CustomGraphicMouseEvent) => void {
    return function (event: CustomGraphicMouseEvent): void {
        // Stop propagation of the event when clicking on a graphic so the event does not propagate to the canvas level
        // Otherwise, the graphicEditorGraphicId will be set to undefined
        event.detail.baseEvent.stopPropagation();

        const graphic: IGraphic | undefined = slideWrapper.store.getters.graphic(slideWrapper.slideId, event.detail.graphicId);
        if (graphic === undefined) {
            console.error(`ERROR: Could not find a graphic with the id: ${event.detail.graphicId}`);
            return;
        }

        // Create preview lines to show snapping
        const snapHighlights: Array<Sketch> = [];

        slideWrapper.focusGraphic(graphic);
        slideWrapper.store.commit('focusGraphic', { slideId: slideWrapper.slideId, graphicId: graphic.id });
        slideWrapper.store.commit('graphicEditorGraphicId', graphic.id);
        slideWrapper.store.commit('removeSnapVectors', { slideId: slideWrapper.slideId, graphicId: graphic.id });

        const initialOrigin: Vector = new Vector(graphic.origin.x, graphic.origin.y);
        const initialPosition: Vector = slideWrapper.getPosition(event);
        const snapVectors: Array<SnapVector> = slideWrapper.store.getters.snapVectors(slideWrapper.slideId);
        const snappableVectorOffsets: Array<Vector> = graphic.getSnappableVectors().map((snappableVector: Vector): Vector => initialPosition.towards(snappableVector));
        let lastPosition: Vector = new Vector(event.detail.baseEvent.clientX, event.detail.baseEvent.clientY);
        let shiftPressed = false;

        slideWrapper.addGraphicEventListener(graphic.id, EVENT_TYPES.GRAPHIC_MOUSE_MOVE, preview);
        slideWrapper.addGraphicEventListener(graphic.id, EVENT_TYPES.GRAPHIC_MOUSE_UP, end);
        slideWrapper.addCanvasEventListener(EVENT_TYPES.CANVAS_KEY_DOWN, toggleStrictMovement);
        slideWrapper.addCanvasEventListener(EVENT_TYPES.CANVAS_KEY_UP, toggleStrictMovement);

        // Preview moving shape
        function preview(event: CustomMouseEvent): void {
            graphic!.anchorIds.forEach((anchorId: string): void => slideWrapper.removeGraphic(anchorId));
            lastPosition = new Vector(event.detail.baseEvent.clientX, event.detail.baseEvent.clientY);
            const position: Vector = slideWrapper.getPosition(event);
            let movement: Vector = initialPosition.towards(position);
            const projection: Vector = getStrictProjectionVector(movement);

            // Remove the old snap highlights
            snapHighlights.forEach((snapHighlight: Sketch): void => slideWrapper.removeGraphic(snapHighlight.id));
            snapHighlights.length = 0;

            // Do not perform any snapping if the alt key is pressed
            if (!event.detail.baseEvent.altKey) {
                const snappableVectors: Array<Vector> = snappableVectorOffsets.map<Vector>((offset: Vector): Vector => position.add(offset));
                const snaps: Array<Snap> = getSnaps(snapVectors, snappableVectors);
                const snapLineScale: number = 5000;

                snaps.forEach((snap: Snap): void => {
                    const snapAngle: number = getTranslation(snap).theta(projection);
                    const snapIsNotParallel: boolean = snapAngle !== 0 && snapAngle !== Math.PI;
                    if (event.detail.baseEvent.shiftKey && snapIsNotParallel) {
                        return;
                    }

                    movement = movement.add(getTranslation(snap));

                    const snapHighlight: Sketch = new Sketch({
                        supplementary: true,
                        origin: snap.destination.origin,
                        points: [snap.destination.direction.scale(-snapLineScale), snap.destination.direction.scale(snapLineScale)],
                        strokeWidth: 2,
                        strokeColor: 'hotpink'
                    });

                    slideWrapper.addGraphic(snapHighlight);
                    snapHighlights.push(snapHighlight);
                });
            }

            graphic!.origin = event.detail.baseEvent.shiftKey ? initialOrigin.add(movement.projectOn(projection)) : initialOrigin.add(movement);
            slideWrapper.updateGraphic(graphic!.id, graphic!);
        }

        // End moving shape
        function end(): void {
            slideWrapper.removeGraphicEventListener(graphic!.id, EVENT_TYPES.GRAPHIC_MOUSE_MOVE, preview);
            slideWrapper.removeGraphicEventListener(graphic!.id, EVENT_TYPES.GRAPHIC_MOUSE_UP, end);
            slideWrapper.removeCanvasEventListener(EVENT_TYPES.CANVAS_KEY_DOWN, toggleStrictMovement);
            slideWrapper.removeCanvasEventListener(EVENT_TYPES.CANVAS_KEY_UP, toggleStrictMovement);

            // Add the new SnapVectors once the graphic move has been finalized
            slideWrapper.store.commit('updateGraphic', { slideId: slideWrapper.slideId, graphicId: graphic!.id, graphic: graphic });
            slideWrapper.store.commit('addSnapVectors', { slideId: slideWrapper.slideId, snapVectors: graphic!.getSnapVectors() });
            slideWrapper.store.commit('focusGraphic', { slideId: slideWrapper.slideId, graphicId: graphic!.id });
            slideWrapper.focusGraphic(graphic);

            // Remove the old snap highlights
            snapHighlights.forEach((snapHighlight: Sketch): void => slideWrapper.removeGraphic(snapHighlight.id));
            snapHighlights.length = 0;
        }

        function toggleStrictMovement(event: CustomCanvasKeyboardEvent): void {
            if (event.detail.baseEvent.key !== 'Shift' || (event.detail.baseEvent.type === 'keydown' && shiftPressed)) {
                return;
            }

            shiftPressed = event.detail.baseEvent.type === 'keydown';
            slideWrapper.dispatchEventOnCanvas<CanvasMouseEvent>(EVENT_TYPES.CANVAS_MOUSE_MOVE, {
                baseEvent: new MouseEvent('mousemove', {
                    shiftKey: event.detail.baseEvent.type === 'keydown',
                    clientX: lastPosition.x,
                    clientY: lastPosition.y
                }),
                slideId: slideWrapper.slideId
            });
        }
    };
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
const slides = document.getElementsByClassName('slide');

(function () {
    window.addEventListener('resize', event => {
        event.preventDefault();
        resizeSlides();
    });

    window.addEventListener('keydown', event => {
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
        slides[i].style.height = height + 'px';
        slides[i].style.width = width + 'px';
    }
}

function advanceSlide() {
    slides[slideIndex].style.display = 'none';
    slideIndex = (slideIndex + 1) % slides.length;
    slides[slideIndex].style.display = 'block';
}

function rewindSlide() {
    slides[slideIndex].style.display = 'none';
    if (slideIndex === 0) slideIndex = slides.length - 1;
    else slideIndex = (slideIndex - 1) % slides.length;
    slides[slideIndex].style.display = 'block';
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
    bindAnchorMouseDown,
    defaultCursorHandler,
    deckScript
};
