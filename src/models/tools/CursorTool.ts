import ICanvasTool from "./ICanvasTool";
import IGraphic from "../graphics/IGraphic";
import Vector from "../Vector";
import SlideWrapper from "../../utilities/SlideWrapper";
import Utilities from "../../utilities/general";
import SnapVector from "../SnapVector";
import Sketch from "../graphics/Sketch";
import GraphicMouseEvent from "../GraphicMouseEvent";
import CanvasMouseEvent from "../CanvasMouseEvent";
import Rectangle from "../graphics/Rectangle";
import Anchor from "../Anchor";

type Snap = { source: Vector, destination: SnapVector };

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

export default class CursorTool implements ICanvasTool {
    public canvasMouseDown(slideWrapper: SlideWrapper): () => void {
        return function (): void {
            slideWrapper.focusGraphic(undefined);
            slideWrapper.store.commit("focusGraphic", { slideId: slideWrapper.store.getters.activeSlide.id, graphicId: undefined });
            slideWrapper.store.commit("styleEditorObject", undefined);
        };
    }

    public canvasMouseOver(): () => void {
        return (): void => { return; };
    }

    public canvasMouseOut(): () => void {
        return (): void => { return; };
    }

    public graphicMouseOver(slideWrapper: SlideWrapper): () => void {
        return function (): void {
            slideWrapper.setCursor("pointer");
        };
    }

    public graphicMouseOut(slideWrapper: SlideWrapper): () => void {
        return function (): void {
            slideWrapper.setCursor("default");
        };
    }

    public graphicMouseDown(slideWrapper: SlideWrapper): (event: CustomEvent<GraphicMouseEvent>) => void {
        return function (event: CustomEvent<GraphicMouseEvent>): void {
            const graphic: IGraphic | undefined = slideWrapper.store.getters.graphic(slideWrapper.slideId, event.detail.graphicId);
            if (graphic === undefined) {
                console.error(`ERROR: Could not find a graphic with the id: ${event.detail.graphicId}`);
                return;
            }

            // Create preview lines to show snapping
            const snapHighlights: Array<Sketch> = [];

            slideWrapper.store.commit("focusGraphic", { slideId: slideWrapper.store.getters.activeSlide.id, graphicId: graphic.id });
            slideWrapper.store.commit("styleEditorObject", graphic);
            slideWrapper.store.commit("removeSnapVectors", { slideId: slideWrapper.slideId, graphicId: graphic.id });

            const initialOrigin: Vector = new Vector(graphic.origin.x, graphic.origin.y);
            const initialPosition: Vector = Utilities.getPosition(event, slideWrapper);
            const snapVectors: Array<SnapVector> = slideWrapper.store.getters.snapVectors(slideWrapper.slideId);
            const snappableVectorOffsets: Array<Vector> = graphic.getSnappableVectors().map((snappableVector: Vector): Vector => initialPosition.towards(snappableVector));
            let lastPosition: Vector = new Vector(event.detail.baseEvent.clientX, event.detail.baseEvent.clientY);
            let shiftPressed = false;

            document.addEventListener("Deck.CanvasMouseMove", preview);
            document.addEventListener("Deck.CanvasMouseUp", end);
            document.addEventListener("Deck.GraphicMouseUp", end);
            document.addEventListener("keydown", toggleStrictMovement);
            document.addEventListener("keyup", toggleStrictMovement);

            // Preview moving shape
            function preview(event: Event): void {
                const customEvent: CustomEvent<GraphicMouseEvent | CanvasMouseEvent> = event as CustomEvent<GraphicMouseEvent | CanvasMouseEvent>;
                lastPosition = new Vector(customEvent.detail.baseEvent.clientX, customEvent.detail.baseEvent.clientY);
                const position: Vector = Utilities.getPosition(customEvent, slideWrapper);
                let movement: Vector = initialPosition.towards(position);
                const projection: Vector = getStrictProjectionVector(movement);

                // Remove the old snap highlights
                snapHighlights.forEach((snapHighlight: Sketch): void => slideWrapper.store.commit("removeGraphic", { slideId: slideWrapper.slideId, graphicId: snapHighlight.id }));
                snapHighlights.length = 0;

                // Do not perform any snapping if the alt key is pressed
                if (!customEvent.detail.baseEvent.altKey) {
                    const snappableVectors: Array<Vector> = snappableVectorOffsets.map<Vector>((offset: Vector): Vector => position.add(offset));
                    const snaps: Array<Snap> = getSnaps(snapVectors, snappableVectors);
                    const snapLineScale: number = 1000;

                    snaps.forEach((snap: Snap): void => {
                        const snapAngle: number = getTranslation(snap).theta(projection);
                        const snapIsNotParallel: boolean = snapAngle !== 0 && snapAngle !== Math.PI;
                        if (customEvent.detail.baseEvent.shiftKey && snapIsNotParallel) {
                            return;
                        }

                        movement = movement.add(getTranslation(snap));

                        const snapHighlight: Sketch = new Sketch({
                            supplementary: true,
                            origin: snap.destination.origin,
                            points: [snap.destination.direction.scale(-snapLineScale), snap.destination.direction.scale(snapLineScale)],
                            strokeWidth: 2,
                            strokeColor: "hotpink"
                        });

                        slideWrapper.store.commit("addGraphic", { slideId: slideWrapper.slideId, graphic: snapHighlight });
                        snapHighlights.push(snapHighlight);
                    });
                }

                graphic!.origin = customEvent.detail.baseEvent.shiftKey ? initialOrigin.add(movement.projectOn(projection)) : initialOrigin.add(movement);
                slideWrapper.store.commit("updateGraphic", { slideId: slideWrapper.slideId, graphicId: graphic!.id, graphic: graphic });
                slideWrapper.store.commit("focusGraphic", { slideId: slideWrapper.slideId, graphicId: graphic!.id });
            }

            // End moving shape
            function end(): void {
                document.removeEventListener("Deck.CanvasMouseMove", preview);
                document.removeEventListener("Deck.CanvasMouseUp", end);
                document.removeEventListener("Deck.GraphicMouseUp", end);
                document.removeEventListener("keydown", toggleStrictMovement);
                document.removeEventListener("keyup", toggleStrictMovement);

                // Add the new SnapVectors once the graphic move has been finalized
                slideWrapper.store.commit("addSnapVectors", { slideId: slideWrapper.slideId, snapVectors: graphic!.getSnapVectors() });

                slideWrapper.store.commit("styleEditorObject", undefined);
                slideWrapper.store.commit("styleEditorObject", graphic);

                // Remove the old snap highlights
                snapHighlights.forEach((snapHighlight: Sketch): void => slideWrapper.store.commit("removeGraphic", { slideId: slideWrapper.slideId, graphicId: snapHighlight.id }));
                snapHighlights.length = 0;
            }

            function toggleStrictMovement(event: KeyboardEvent): void {
                if (event.key !== "Shift" || (event.type === "keydown" && shiftPressed)) {
                    return;
                }

                shiftPressed = event.type === "keydown";
                document.dispatchEvent(new CustomEvent<CanvasMouseEvent>("Deck.CanvasMouseMove", {
                    detail: new CanvasMouseEvent(
                        new MouseEvent("mousemove", {
                            shiftKey: event.type === "keydown",
                            clientX: lastPosition.x,
                            clientY: lastPosition.y
                        }),
                        slideWrapper.slideId
                    )
                }));
            }
        };
    }
}
