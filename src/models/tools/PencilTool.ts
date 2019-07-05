import { CustomCanvasMouseEvent, CustomMouseEvent, ISlideWrapper } from "../../types";
import { Sketch } from "../graphics/graphics";
import CanvasTool from "./CanvasTool";

export default class PencilTool extends CanvasTool {
    public canvasMouseDown(slideWrapper: ISlideWrapper): (event: CustomCanvasMouseEvent) => void {
        return function (event: CustomCanvasMouseEvent): void {
            document.addEventListener("Deck.CanvasMouseMove", preview as EventListener);
            document.addEventListener("Deck.CanvasMouseUp", end);
            document.addEventListener("Deck.GraphicMouseUp", end);

            // Unfocus the current graphic if any and set initial state of pencil drawing
            slideWrapper.store.commit("focusGraphic", { slideId: slideWrapper.store.getters.activeSlide.id, graphicId: undefined });
            slideWrapper.store.commit("graphicEditorObject", undefined);

            const sketch: Sketch = new Sketch({ origin: slideWrapper.getPosition(event), fillColor: "none", strokeColor: "black", strokeWidth: 3 });
            slideWrapper.store.commit("addGraphic", { slideId: slideWrapper.slideId, graphic: sketch });

            // Add the current mouse position to the list of points to plot
            function preview(event: CustomMouseEvent): void {
                sketch.points.push(slideWrapper.getPosition(event).add(sketch.origin.scale(-1)));
                slideWrapper.store.commit("updateGraphic", { slideId: slideWrapper.slideId, graphicId: sketch.id, graphic: sketch });
            }

            // Unbind handlers and commit graphic to the application
            function end(): void {
                document.removeEventListener("Deck.CanvasMouseMove", preview as EventListener);
                document.removeEventListener("Deck.CanvasMouseUp", end);
                document.removeEventListener("Deck.GraphicMouseUp", end);

                slideWrapper.store.commit("focusGraphic", { slideId: slideWrapper.store.getters.activeSlide.id, graphicId: sketch.id });
                slideWrapper.store.commit("graphicEditorObject", sketch);
                slideWrapper.store.commit("addSnapVectors", { slideId: slideWrapper.store.getters.activeSlide.id, snapVectors: sketch.getSnapVectors() });
                slideWrapper.store.commit("tool", "cursor");
                slideWrapper.setCursor("default");
            }
        };
    }

    public canvasMouseOver(slideWrapper: ISlideWrapper): () => void {
        return (): void => slideWrapper.setCursor("crosshair");
    }

    public canvasMouseOut(slideWrapper: ISlideWrapper): () => void {
        return (): void => slideWrapper.setCursor("default");
    }

    public graphicMouseOver(slideWrapper: ISlideWrapper): () => void {
        return (): void => slideWrapper.setCursor("crosshair");
    }
}
