import ICanvasTool from "./ICanvasTool";
import Sketch from "../graphics/Sketch";
import SlideWrapper from "../../utilities/SlideWrapper";
import Utilities from "../../utilities/general";

export default class PencilTool implements ICanvasTool {
    public name: string;

    private noop: () => void = (): void => { return; };
    private cursor: string = "crosshair";
    private defaultCursor: string = "default";

    constructor(name: string) {
        this.name = name;
    }

    public canvasMouseDown(slideWrapper: SlideWrapper): (event: CustomEvent) => void {
        this.noop();
        return function (event: CustomEvent): void {
            document.addEventListener("Deck.CanvasMouseMove", preview);
            document.addEventListener("Deck.CanvasMouseUp", end);
            document.addEventListener("Deck.GraphicMouseUp", end);

            // Unfocus the current graphic if any and set initial state of pencil drawing
            slideWrapper.focusGraphic(undefined);
            slideWrapper.store.commit("focusGraphic", undefined);
            slideWrapper.store.commit("styleEditorObject", undefined);

            const sketch: Sketch = new Sketch({ origin: Utilities.getPosition(event, slideWrapper.store), fillColor: "none", strokeColor: "black", strokeWidth: 3 });
            slideWrapper.addGraphic(sketch);

            // Add the current mouse position to the list of points to plot
            function preview(event: Event): void {
                sketch.points.push(Utilities.getPosition(event as CustomEvent, slideWrapper.store).add(sketch.origin.scale(-1)));
                slideWrapper.updateGraphic(sketch.id, sketch);
            }

            // Unbind handlers and commit graphic to the application
            function end(): void {
                document.removeEventListener("Deck.CanvasMouseMove", preview);
                document.removeEventListener("Deck.CanvasMouseUp", end);
                document.removeEventListener("Deck.GraphicMouseUp", end);

                slideWrapper.store.commit("addGraphic", { slideId: slideWrapper.slideId, graphic: sketch });
                slideWrapper.store.commit("focusGraphic", sketch);
                slideWrapper.store.commit("styleEditorObject", sketch);
                slideWrapper.focusGraphic(sketch.id);
            }
        };
    }

    public canvasMouseOver(slideWrapper: SlideWrapper): () => void {
        const self: PencilTool = this;
        return function () {
            slideWrapper.setCursor(self.cursor);
        };
    }

    public canvasMouseOut(slideWrapper: SlideWrapper): () => void {
        const self: PencilTool = this;
        return function () {
            slideWrapper.setCursor(self.defaultCursor);
        };
    }

    public graphicMouseOver(slideWrapper: SlideWrapper): () => void {
        const self: PencilTool = this;
        return function () {
            slideWrapper.setCursor(self.cursor);
        };
    }

    public graphicMouseOut(): () => void {
        return this.noop;
    }

    public graphicMouseDown(): () => void {
        return this.noop;
    }
}
