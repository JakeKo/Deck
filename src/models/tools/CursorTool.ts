import ICanvasTool from "./ICanvasTool";
import IGraphic from "../graphics/IGraphic";
import Point from "../Point";
import SlideWrapper from "../../utilities/SlideWrapper";
import Utilities from "../../utilities/general";

export default class CursorTool implements ICanvasTool {
    public name: string;

    private noop: () => void = (): void => { return; };
    private cursor: string = "pointer";
    private defaultCursor: string = "default";
    private objectToFocus?: string = undefined;

    constructor(name: string) {
        this.name = name;
    }

    public canvasMouseDown(slideWrapper: SlideWrapper): () => void {
        const self: CursorTool = this;
        return function (): void {
            slideWrapper.focusGraphic(self.objectToFocus);
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
            const graphic: IGraphic | undefined = slideWrapper.getGraphic(event.detail.graphicId);
            if (graphic === undefined) {
                console.error(`ERROR: Could not find a graphic with the id: ${event.detail.graphicId}`);
                return;
            }

            slideWrapper.focusGraphic(graphic.id);
            slideWrapper.store.commit("focusGraphic", graphic);
            slideWrapper.store.commit("styleEditorObject", graphic);

            const initialPosition: Point = Utilities.getPosition(event, slideWrapper.store);
            const initialOrigin: Point = graphic.origin;

            document.addEventListener("Deck.CanvasMouseMove", preview);
            document.addEventListener("Deck.CanvasMouseUp", end);
            document.addEventListener("Deck.GraphicMouseUp", end);

            // Preview moving shape
            function preview(event: Event): void {
                const position: Point = Utilities.getPosition(event as CustomEvent, slideWrapper.store);
                const cursorOffset: Point = position.add(initialPosition.scale(-1));
                graphic!.origin = initialOrigin.add(cursorOffset);
                slideWrapper.updateGraphic(graphic!.id, graphic!);
                slideWrapper.focusGraphic(graphic!.id); // Update the bounding box on preview
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
