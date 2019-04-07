import ICanvasTool from "./ICanvasTool";
import IGraphic from "../graphics/IGraphic";
import Vector from "../Vector";
import SlideWrapper from "../../utilities/SlideWrapper";
import Utilities from "../../utilities/general";
import SnapVector from "../SnapVector";

type Snap = { source: Vector, destination: Vector };

function getClosestSnap(snaps: Array<Snap>): Snap | undefined {
    if (snaps.length === 0) {
        return;
    }

    let closestSnap: Snap = snaps[0];
    snaps.forEach((snap: Snap): void => {
        if (snap.source.towards(snap.destination).magnitude < closestSnap.source.towards(closestSnap.destination).magnitude) {
            closestSnap = snap;
        }
    });

    return closestSnap;
}

function getTranslation(snap: Snap): Vector {
    return snap.source.towards(snap.destination);
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

    public graphicMouseDown(slideWrapper: SlideWrapper): (event: CustomEvent) => void {
        return function (event: CustomEvent): void {
            const graphic: IGraphic | undefined = slideWrapper.store.getters.graphic(slideWrapper.slideId, event.detail.graphicId);
            if (graphic === undefined) {
                console.error(`ERROR: Could not find a graphic with the id: ${event.detail.graphicId}`);
                return;
            }

            slideWrapper.store.commit("focusGraphic", { slideId: slideWrapper.store.getters.activeSlide.id, graphicId: graphic.id });
            slideWrapper.store.commit("styleEditorObject", graphic);
            slideWrapper.store.commit("removeSnapVectors", { slideId: slideWrapper.slideId, graphicId: graphic.id });

            const position: Vector = Utilities.getPosition(event, slideWrapper);
            const cursorOffset: Vector = position.towards(graphic.origin);
            const snapVectors: Array<SnapVector> = slideWrapper.store.getters.snapVectors(slideWrapper.slideId);
            const snappableVectorOffsets: Array<Vector> = graphic.getSnappableVectors().map((snappableVector: Vector): Vector => position.towards(snappableVector));

            document.addEventListener("Deck.CanvasMouseMove", preview);
            document.addEventListener("Deck.CanvasMouseUp", end);
            document.addEventListener("Deck.GraphicMouseUp", end);

            // Preview moving shape
            function preview(event: Event): void {
                const position: Vector = Utilities.getPosition(event as CustomEvent, slideWrapper);
                graphic!.origin = position.add(cursorOffset);

                const snaps: Array<Snap> = [];
                const snappableVectors: Array<Vector> = snappableVectorOffsets.map<Vector>((offset: Vector): Vector => position.add(offset));

                // List all combinations of snap and snappable vectors
                snapVectors.forEach((snapVector: SnapVector): void => {
                    snappableVectors.forEach((snappableVector: Vector): void => {
                        snaps.push({ source: snappableVector, destination: snapVector.getClosestPoint(snappableVector) });
                    });
                });

                // Filter by all snap translations within some epsilon and finish if there are no close translations
                const closeSnaps: Array<Snap> = snaps.filter((snap: Snap): boolean => getTranslation(snap).magnitude < 20);
                const mainSnap: Snap | undefined = getClosestSnap(closeSnaps);
                if (mainSnap === undefined) {
                    slideWrapper.store.commit("updateGraphic", { slideId: slideWrapper.slideId, graphicId: graphic!.id, graphic: graphic });
                    slideWrapper.store.commit("focusGraphic", { slideId: slideWrapper.slideId, graphicId: graphic!.id });
                    return;
                }

                // Find all translations that could also be performed without interfering with the main translation (i.e. the vectors are orthogonal)
                const compatibleSnaps: Array<Snap> = closeSnaps.filter((snap: Snap): boolean => getTranslation(snap).dot(getTranslation(mainSnap)) === 0);
                const compatibleSnap: Snap | undefined = getClosestSnap(compatibleSnaps);

                graphic!.origin = graphic!.origin.add(getTranslation(mainSnap));
                if (compatibleSnap !== undefined) {
                    graphic!.origin = graphic!.origin.add(getTranslation(compatibleSnap));
                }

                slideWrapper.store.commit("updateGraphic", { slideId: slideWrapper.slideId, graphicId: graphic!.id, graphic: graphic });
                slideWrapper.store.commit("focusGraphic", { slideId: slideWrapper.slideId, graphicId: graphic!.id });
            }

            // End moving shape
            function end(): void {
                document.removeEventListener("Deck.CanvasMouseMove", preview);
                document.removeEventListener("Deck.CanvasMouseUp", end);
                document.removeEventListener("Deck.GraphicMouseUp", end);

                // Add the new SnapVectors once the graphic move has been finalized
                slideWrapper.store.commit("addSnapVectors", { slideId: slideWrapper.slideId, snapVectors: graphic!.getSnapVectors() });

                slideWrapper.store.commit("styleEditorObject", undefined);
                slideWrapper.store.commit("styleEditorObject", graphic);
            }
        };
    }
}
