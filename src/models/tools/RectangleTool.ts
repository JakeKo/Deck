import ICanvasTool from "./ICanvasTool";
import Rectangle from "../graphics/Rectangle";
import Vector from "../Vector";
import SlideWrapper from "../../utilities/SlideWrapper";
import CanvasMouseEvent from "../CanvasMouseEvent";
import GraphicMouseEvent from "../GraphicMouseEvent";

export default class RectangleTool implements ICanvasTool {
    public canvasMouseDown(slideWrapper: SlideWrapper): (event: CustomEvent<CanvasMouseEvent>) => void {
        return function (event: CustomEvent<CanvasMouseEvent>): void {
            document.addEventListener("Deck.CanvasMouseMove", preview);
            document.addEventListener("Deck.CanvasMouseUp", end);
            document.addEventListener("Deck.GraphicMouseUp", end);
            document.addEventListener("keydown", toggleSquare);
            document.addEventListener("keyup", toggleSquare);

            slideWrapper.store.commit("focusGraphic", { slideId: slideWrapper.store.getters.activeSlide.id, graphicId: undefined });
            slideWrapper.store.commit("styleEditorObject", undefined);

            const start: Vector = slideWrapper.getPosition(event);
            const rectangle: Rectangle = new Rectangle({ origin: new Vector(start.x, start.y), fillColor: "black", strokeColor: "none", width: 1, height: 1 });
            slideWrapper.store.commit("addGraphic", { slideId: slideWrapper.slideId, graphic: rectangle });
            let lastPosition: Vector = new Vector(event.detail.baseEvent.clientX, event.detail.baseEvent.clientY);
            let shiftPressed = false;

            // Preview drawing rectangle
            function preview(event: Event): void {
                const customEvent: CustomEvent<GraphicMouseEvent | CanvasMouseEvent> = event as CustomEvent<GraphicMouseEvent | CanvasMouseEvent>;

                // Determine dimensions for a rectangle or square (based on if shift is pressed)
                lastPosition = new Vector(customEvent.detail.baseEvent.clientX, customEvent.detail.baseEvent.clientY);
                const position: Vector = slideWrapper.getPosition(event as CustomEvent);
                const rawDimensions: Vector = position.add(start.scale(-1));
                const minimumDimension: number = Math.min(Math.abs(rawDimensions.x), Math.abs(rawDimensions.y));

                // Enforce that a shape has positive width and height i.e. move the x and y if the width or height are negative
                rectangle.origin.x = rawDimensions.x < 0 ? start.x + (customEvent.detail.baseEvent.shiftKey ? -minimumDimension : rawDimensions.x) : rectangle.origin.x;
                rectangle.origin.y = rawDimensions.y < 0 ? start.y + (customEvent.detail.baseEvent.shiftKey ? -minimumDimension : rawDimensions.y) : rectangle.origin.y;

                rectangle.width = customEvent.detail.baseEvent.shiftKey ? minimumDimension : Math.abs(rawDimensions.x);
                rectangle.height = customEvent.detail.baseEvent.shiftKey ? minimumDimension : Math.abs(rawDimensions.y);
                slideWrapper.store.commit("updateGraphic", { slideId: slideWrapper.slideId, graphicId: rectangle.id, graphic: rectangle });
            }

            // End drawing rectangle
            function end(): void {
                document.removeEventListener("Deck.CanvasMouseMove", preview);
                document.removeEventListener("Deck.CanvasMouseUp", end);
                document.removeEventListener("Deck.GraphicMouseUp", end);
                document.removeEventListener("keydown", toggleSquare);
                document.removeEventListener("keyup", toggleSquare);

                slideWrapper.store.commit("focusGraphic", { slideId: slideWrapper.store.getters.activeSlide.id, graphicId: rectangle.id });
                slideWrapper.store.commit("styleEditorObject", rectangle);
                slideWrapper.store.commit("addSnapVectors", { slideId: slideWrapper.store.getters.activeSlide.id, snapVectors: rectangle.getSnapVectors() });
                slideWrapper.store.commit("tool", "cursor");
            }

            function toggleSquare(event: KeyboardEvent): void {
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
