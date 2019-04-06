import ICanvasTool from "./ICanvasTool";
import Sketch from "../graphics/Sketch";
import SlideWrapper from "../../utilities/SlideWrapper";
import Utilities from "../../utilities/general";

export default class PencilTool implements ICanvasTool {
    public canvasMouseDown(slideWrapper: SlideWrapper): (event: CustomEvent) => void {
        return function (event: CustomEvent): void {
            document.addEventListener("Deck.CanvasMouseMove", preview);
            document.addEventListener("Deck.CanvasMouseUp", end);
            document.addEventListener("Deck.GraphicMouseUp", end);

            // Unfocus the current graphic if any and set initial state of pencil drawing
            slideWrapper.store.commit("focusGraphic", { slideId: slideWrapper.store.getters.activeSlide.id, graphicId: undefined });
            slideWrapper.store.commit("styleEditorObject", undefined);

            const sketch: Sketch = new Sketch({ origin: Utilities.getPosition(event, slideWrapper), fillColor: "none", strokeColor: "black", strokeWidth: 3 });
            slideWrapper.store.commit("addGraphic", { slideId: slideWrapper.slideId, graphic: sketch });

            // Add the current mouse position to the list of points to plot
            function preview(event: Event): void {
                sketch.points.push(Utilities.getPosition(event as CustomEvent, slideWrapper).add(sketch.origin.scale(-1)));
                slideWrapper.store.commit("updateGraphic", { slideId: slideWrapper.slideId, graphicId: sketch.id, graphic: sketch });
            }

            // Unbind handlers and commit graphic to the application
            function end(): void {
                document.removeEventListener("Deck.CanvasMouseMove", preview);
                document.removeEventListener("Deck.CanvasMouseUp", end);
                document.removeEventListener("Deck.GraphicMouseUp", end);

                slideWrapper.store.commit("focusGraphic", { slideId: slideWrapper.store.getters.activeSlide.id, graphicId: sketch.id });
                slideWrapper.store.commit("styleEditorObject", sketch);
                slideWrapper.store.commit("addSnapVectors", { slideId: slideWrapper.store.getters.activeSlide.id, snapVectors: sketch.getSnapVectors() });
            }
        };
    }

    public canvasMouseOver(slideWrapper: SlideWrapper): () => void {
        return function () {
            slideWrapper.setCursor("crosshair");
        };
    }

    public canvasMouseOut(slideWrapper: SlideWrapper): () => void {
        return function () {
            slideWrapper.setCursor("default");
        };
    }

    public graphicMouseOver(slideWrapper: SlideWrapper): () => void {
        return function () {
            slideWrapper.setCursor("crosshair");
        };
    }

    public graphicMouseOut(): () => void {
        return (): void => { return; };
    }

    public graphicMouseDown(): () => void {
        return (): void => { return; };
    }
}
