import ICanvasTool from "./ICanvasTool";
import IGraphic from "../graphics/IGraphic";
import Vector from "../Vector";
import SlideWrapper from "../../utilities/SlideWrapper";
import Utilities from "../../utilities/general";
import SnapVector from "../SnapVector";
import Ellipse from "../graphics/Ellipse";

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
        const c1: Ellipse = new Ellipse({ origin: new Vector(-7.5, -7.5), fillColor: "red", strokeColor: "none", width: 15, height: 15 });
        const c2: Ellipse = new Ellipse({ origin: new Vector(-7.5, -7.5), fillColor: "purple", strokeColor: "none", width: 15, height: 15 });
        slideWrapper.store.commit("addGraphic", { slideId: slideWrapper.slideId, graphic: c1 });
        slideWrapper.store.commit("addGraphic", { slideId: slideWrapper.slideId, graphic: c2 });

        return function (event: CustomEvent): void {
            const graphic: IGraphic | undefined = slideWrapper.store.getters.graphic(slideWrapper.slideId, event.detail.graphicId);
            if (graphic === undefined) {
                console.error(`ERROR: Could not find a graphic with the id: ${event.detail.graphicId}`);
                return;
            }

            slideWrapper.store.commit("focusGraphic", { slideId: slideWrapper.store.getters.activeSlide.id, graphicId: graphic.id });
            slideWrapper.store.commit("styleEditorObject", graphic);
            slideWrapper.store.commit("removeSnapVectors", { slideId: slideWrapper.slideId, graphicId: graphic.id });

            const cursorOffset: Vector = graphic.origin.add(Utilities.getPosition(event, slideWrapper).scale(-1));
            const snapVectors: Array<SnapVector> = slideWrapper.store.getters.snapVectors(slideWrapper.slideId);

            document.addEventListener("Deck.CanvasMouseMove", preview);
            document.addEventListener("Deck.CanvasMouseUp", end);
            document.addEventListener("Deck.GraphicMouseUp", end);

            // Preview moving shape
            function preview(event: Event): void {
                graphic!.origin = Utilities.getPosition(event as CustomEvent, slideWrapper).add(cursorOffset);

                const snapTranslations: Array<{ source: Vector, destination: SnapVector }> = [];
                const snappableVectors: Array<Vector> = graphic!.getSnappableVectors(slideWrapper.getRenderedGraphic(graphic!.id));
                snapVectors.forEach((snapVector: SnapVector): void => {
                    // Find the closest snappable vector
                    const snapTranslation: { source: Vector, destination: SnapVector } = { source: snappableVectors[0], destination: snapVector };
                    snappableVectors.forEach((snappableVector: Vector): void => {
                        if (snapVector.distanceFromVector(snappableVector) < snapTranslation.destination.distanceFromVector(snapTranslation.source)) {
                            snapTranslation.source = snappableVector;
                        }
                    });

                    // If the closest snappable vector is within a specific radius, add it to potential snap translations
                    if (snapTranslation.destination.distanceFromVector(snapTranslation.source) <= 10) {
                        snapTranslations.push(snapTranslation);
                    }
                });

                if (snapTranslations.length > 0) {
                    let snapTranslation: { source: Vector, destination: SnapVector } = snapTranslations[0];
                    snapTranslations.forEach((s: { source: Vector, destination: SnapVector }): void => {
                        if (s.destination.distanceFromVector(s.source) < snapTranslation.destination.distanceFromVector(snapTranslation.source)) {
                            snapTranslation = s;
                        }
                    });

                    c1.origin = snapTranslation.source.add(new Vector(-7.5, -7.5));
                    c2.origin = snapTranslation.destination.origin.add(new Vector(-7.5, -7.5));
                    slideWrapper.store.commit("updateGraphic", { slideId: slideWrapper.slideId, graphicId: c1.id, graphic: c1 });
                    slideWrapper.store.commit("updateGraphic", { slideId: slideWrapper.slideId, graphicId: c2.id, graphic: c2 });
                } else {
                    c1.origin = new Vector(-7.5, -7.5);
                    c2.origin = new Vector(-7.5, -7.5);
                    slideWrapper.store.commit("updateGraphic", { slideId: slideWrapper.slideId, graphicId: c1.id, graphic: c1 });
                    slideWrapper.store.commit("updateGraphic", { slideId: slideWrapper.slideId, graphicId: c2.id, graphic: c2 });
                }

                // Update the graphic and refresh focus to update bounding box
                slideWrapper.store.commit("updateGraphic", { slideId: slideWrapper.slideId, graphicId: graphic!.id, graphic: graphic });
                slideWrapper.store.commit("focusGraphic", { slideId: slideWrapper.slideId, graphicId: graphic!.id });
            }

            // End moving shape
            function end(): void {
                document.removeEventListener("Deck.CanvasMouseMove", preview);
                document.removeEventListener("Deck.CanvasMouseUp", end);
                document.removeEventListener("Deck.GraphicMouseUp", end);

                // Add the new SnapVectors once the graphic move has been finalized
                slideWrapper.store.commit("addSnapVectors", { slideId: slideWrapper.slideId, snapVectors: graphic!.getSnapVectors(slideWrapper.getRenderedGraphic(graphic!.id)) });

                slideWrapper.store.commit("styleEditorObject", undefined);
                slideWrapper.store.commit("styleEditorObject", graphic);
            }
        };
    }
}
