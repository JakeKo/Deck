import ICanvasTool from "./ICanvasTool";
import IGraphic from "../graphics/IGraphic";
import Vector from "../Vector";
import SlideWrapper from "../../utilities/SlideWrapper";
import Utilities from "../../utilities/general";
import SnapVector from "../SnapVector";

export default class CursorTool implements ICanvasTool {
    public name: string;

    private noop: () => void = (): void => { return; };
    private cursor: string = "pointer";
    private defaultCursor: string = "default";
    private objectToFocus?: IGraphic = undefined;

    constructor(name: string) {
        this.name = name;
    }

    public canvasMouseDown(slideWrapper: SlideWrapper): () => void {
        const self: CursorTool = this;
        return function (): void {
            slideWrapper.focusGraphic(self.objectToFocus);
            slideWrapper.store.commit("focusGraphic", { slideId: slideWrapper.store.getters.activeSlide.id, graphicId: undefined });
            slideWrapper.store.commit("styleEditorObject", undefined);
        };
    }

    public canvasMouseOver(): () => void {
        return this.noop;
    }

    public canvasMouseOut(): () => void {
        return this.noop;
    }

    public graphicMouseOver(slideWrapper: SlideWrapper): () => void {
        const self: CursorTool = this;
        return function (): void {
            slideWrapper.setCursor(self.cursor);
        };
    }

    public graphicMouseOut(slideWrapper: SlideWrapper): () => void {
        const self: CursorTool = this;
        return function (): void {
            slideWrapper.setCursor(self.defaultCursor);
        };
    }

    public graphicMouseDown(slideWrapper: SlideWrapper): (event: CustomEvent) => void {
        this.noop();
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

                const snapTranslations: Array<Vector> = [];
                const snappableVectors: Array<Vector> = snappableVectorOffsets.map<Vector>((offset: Vector): Vector => position.add(offset));

                // List all combinations of snap and snappable vectors
                snapVectors.forEach((snapVector: SnapVector): void => {
                    snappableVectors.forEach((snappableVector: Vector): void => {
                        snapTranslations.push(snappableVector.towards(snapVector.getClosestPoint(snappableVector)));
                    });
                });

                // Find the closest snap translation
                let finalSnapTranslation: Vector = snapTranslations[0];
                snapTranslations.forEach((snapTranslation: Vector): void => {
                    if (snapTranslation.magnitude < finalSnapTranslation.magnitude) {
                        finalSnapTranslation = snapTranslation;
                    }
                });

                // Commit the closest snap translation if it is sufficiently close to a snap vector
                if (finalSnapTranslation.magnitude < 10) {
                    graphic!.origin = graphic!.origin.add(finalSnapTranslation);
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
