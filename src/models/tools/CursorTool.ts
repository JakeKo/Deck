import ICanvasTool from "./ICanvasTool";
import IGraphic from "../graphics/IGraphic";
import Vector from "../Vector";
import SlideWrapper from "../../utilities/SlideWrapper";
import Utilities from "../../utilities/general";
import * as SVG from "svg.js";

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

            const cursorOffset: Vector = graphic.origin.add(Utilities.getPosition(event, slideWrapper).scale(-1));

            document.addEventListener("Deck.CanvasMouseMove", preview);
            document.addEventListener("Deck.CanvasMouseUp", end);
            document.addEventListener("Deck.GraphicMouseUp", end);

            // Preview moving shape
            function preview(event: Event): void {
                graphic!.origin = Utilities.getPosition(event as CustomEvent, slideWrapper).add(cursorOffset);

                // Update the graphic and refresh focus to update bounding box
                slideWrapper.store.commit("updateGraphic", { slideId: slideWrapper.slideId, graphicId: graphic!.id, graphic: graphic });
                slideWrapper.store.commit("focusGraphic", { slideId: slideWrapper.slideId, graphicId: graphic!.id });

                const svg: SVG.Element = slideWrapper.getRenderedGraphic(graphic!.id);
                slideWrapper.store.commit("removeSnapVectors", { slideId: slideWrapper.slideId, graphicId: graphic!.id });
                slideWrapper.store.commit("addSnapVectors", { slideId: slideWrapper.slideId, snapVectors: graphic!.getSnapVectors(svg) });
            }

            // End moving shape
            function end(): void {
                document.removeEventListener("Deck.CanvasMouseMove", preview);
                document.removeEventListener("Deck.CanvasMouseUp", end);
                document.removeEventListener("Deck.GraphicMouseUp", end);

                slideWrapper.store.commit("styleEditorObject", undefined);
                slideWrapper.store.commit("styleEditorObject", graphic);
            }
        };
    }
}
