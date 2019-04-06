import ICanvasTool from "./ICanvasTool";
import IGraphic from "../graphics/IGraphic";
import Vector from "../Vector";
import SlideWrapper from "../../utilities/SlideWrapper";
import Utilities from "../../utilities/general";
import SnapVector from "../SnapVector";

function getClosestTranslation(translations: Array<Vector>): Vector | undefined {
    if (translations.length === 0) {
        return;
    }

    let closestTranslation: Vector = translations[0];
    translations.forEach((translation: Vector): void => {
        if (translation.magnitude < closestTranslation.magnitude) {
            closestTranslation = translation;
        }
    });

    return closestTranslation;
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
            const snappableVectorOffsets: Array<Vector> = graphic.getSnappableVectors().map<Vector>((snappableVector: Vector): Vector => position.towards(snappableVector));

            document.addEventListener("Deck.CanvasMouseMove", preview);
            document.addEventListener("Deck.CanvasMouseUp", end);
            document.addEventListener("Deck.GraphicMouseUp", end);

            // Preview moving shape
            function preview(event: Event): void {
                const position: Vector = Utilities.getPosition(event as CustomEvent, slideWrapper);
                graphic!.origin = position.add(cursorOffset);

                const translations: Array<Vector> = [];
                const snappableVectors: Array<Vector> = snappableVectorOffsets.map<Vector>((offset: Vector): Vector => position.add(offset));

                // List all combinations of snap and snappable vectors
                snapVectors.forEach((snapVector: SnapVector): void => {
                    snappableVectors.forEach((snappableVector: Vector): void => {
                        translations.push(snappableVector.towards(snapVector.getClosestPoint(snappableVector)));
                    });
                });

                // Filter by all snap translations within some epsilon and finish if there are no close translations
                const closeTranslations: Array<Vector> = translations.filter((snapTranslation: Vector): boolean => snapTranslation.magnitude < 10);
                const mainTranslation: Vector | undefined = getClosestTranslation(closeTranslations);
                if (mainTranslation === undefined) {
                    slideWrapper.store.commit("updateGraphic", { slideId: slideWrapper.slideId, graphicId: graphic!.id, graphic: graphic });
                    slideWrapper.store.commit("focusGraphic", { slideId: slideWrapper.slideId, graphicId: graphic!.id });
                    return;
                }

                // Find all translations that could also be performed without interfering with the main translation (i.e. the vectors are orthogonal)
                const compatibleTranslations: Array<Vector> = closeTranslations.filter((translation: Vector): boolean => translation.dot(mainTranslation) === 0);
                const compatibleTranslation: Vector | undefined = getClosestTranslation(compatibleTranslations);

                graphic!.origin = graphic!.origin.add(mainTranslation);
                if (compatibleTranslation !== undefined) {
                    graphic!.origin = graphic!.origin.add(compatibleTranslation);
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
