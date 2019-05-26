import ICanvasTool from "./ICanvasTool";
import Ellipse from "../graphics/Ellipse";
import Vector from "../Vector";
import SlideWrapper from "../../utilities/SlideWrapper";
import CanvasMouseEvent from "../CanvasMouseEvent";
import GraphicMouseEvent from "../GraphicMouseEvent";

export default class EllipseTool implements ICanvasTool {
    public canvasMouseDown(slideWrapper: SlideWrapper): (event: CustomEvent<CanvasMouseEvent>) => void {
        return function (event: CustomEvent<CanvasMouseEvent>): void {
            document.addEventListener("Deck.CanvasMouseMove", preview);
            document.addEventListener("Deck.CanvasMouseUp", end);
            document.addEventListener("Deck.GraphicMouseUp", end);
            document.addEventListener("keydown", toggleCircle);
            document.addEventListener("keyup", toggleCircle);

            slideWrapper.store.commit("focusGraphic", { slideId: slideWrapper.store.getters.activeSlide.id, graphicId: undefined });
            slideWrapper.store.commit("styleEditorObject", undefined);

            const start: Vector = slideWrapper.getPosition(event);
            const ellipse: Ellipse = new Ellipse({ origin: new Vector(start.x, start.y), fillColor: "black", strokeColor: "none", width: 1, height: 1 });
            slideWrapper.store.commit("addGraphic", { slideId: slideWrapper.slideId, graphic: ellipse });
            let lastPosition: Vector = new Vector(event.detail.baseEvent.clientX, event.detail.baseEvent.clientY);
            let shiftPressed = false;

            // Preview drawing ellipse
            function preview(event: Event): void {
                const customEvent: CustomEvent<GraphicMouseEvent | CanvasMouseEvent> = event as CustomEvent<GraphicMouseEvent | CanvasMouseEvent>;

                // Determine dimensions for an ellipse or circle (based on if shift is pressed)
                lastPosition = new Vector(customEvent.detail.baseEvent.clientX, customEvent.detail.baseEvent.clientY);
                const position: Vector = slideWrapper.getPosition(customEvent);
                const rawOffset: Vector = position.add(start.scale(-1));
                const minimumOffset: number = Math.min(Math.abs(rawOffset.x), Math.abs(rawOffset.y));

                // Enforce that a shape has positive width and height i.e. move the x and y if the width or height are negative
                ellipse.origin.x = start.x + (customEvent.detail.baseEvent.shiftKey ? Math.sign(rawOffset.x) * minimumOffset : rawOffset.x) * 0.5;
                ellipse.origin.y = start.y + (customEvent.detail.baseEvent.shiftKey ? Math.sign(rawOffset.y) * minimumOffset : rawOffset.y) * 0.5;

                ellipse.width = customEvent.detail.baseEvent.shiftKey ? minimumOffset : Math.abs(rawOffset.x);
                ellipse.height = customEvent.detail.baseEvent.shiftKey ? minimumOffset : Math.abs(rawOffset.y);
                slideWrapper.store.commit("updateGraphic", { slideId: slideWrapper.slideId, graphicId: ellipse.id, graphic: ellipse });
            }

            // End drawing ellipse
            function end(): void {
                document.removeEventListener("Deck.CanvasMouseMove", preview);
                document.removeEventListener("Deck.CanvasMouseUp", end);
                document.removeEventListener("Deck.GraphicMouseUp", end);
                document.removeEventListener("keydown", toggleCircle);
                document.removeEventListener("keyup", toggleCircle);

                slideWrapper.store.commit("focusGraphic", { slideId: slideWrapper.store.getters.activeSlide.id, graphicId: ellipse.id });
                slideWrapper.store.commit("styleEditorObject", ellipse);
                slideWrapper.store.commit("addSnapVectors", { slideId: slideWrapper.store.getters.activeSlide.id, snapVectors: ellipse.getSnapVectors() });
                slideWrapper.store.commit("tool", "cursor");
            }

            function toggleCircle(event: KeyboardEvent): void {
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
            slideWrapper.setCursor("default");
        };
    }

    public graphicMouseOut(): () => void {
        return (): void => { return; };
    }

    public graphicMouseDown(): () => void {
        return (): void => { return; };
    }
}
