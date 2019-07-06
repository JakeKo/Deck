import { CustomCanvasMouseEvent, CustomMouseEvent, ISlideWrapper } from "../../types";
import { Ellipse } from "../graphics/graphics";
import Vector from "../Vector";
import CanvasMouseEvent from "../CanvasMouseEvent";
import CanvasTool from "./CanvasTool";

export default class EllipseTool extends CanvasTool {
    public canvasMouseDown(slideWrapper: ISlideWrapper): (event: CustomCanvasMouseEvent) => void {
        return function (event: CustomCanvasMouseEvent): void {
            document.addEventListener("Deck.CanvasMouseMove", preview as EventListener);
            document.addEventListener("Deck.CanvasMouseUp", end);
            document.addEventListener("Deck.GraphicMouseUp", end);
            document.addEventListener("keydown", toggleCircle);
            document.addEventListener("keyup", toggleCircle);

            slideWrapper.store.commit("focusGraphic", { slideId: slideWrapper.store.getters.activeSlide.id, graphicId: undefined });
            slideWrapper.store.commit("graphicEditorGraphicId", undefined);

            const start: Vector = slideWrapper.getPosition(event);
            const ellipse: Ellipse = new Ellipse({ origin: new Vector(start.x, start.y), fillColor: "black", strokeColor: "none", width: 1, height: 1 });
            slideWrapper.store.commit("addGraphic", { slideId: slideWrapper.slideId, graphic: ellipse });
            let lastPosition: Vector = new Vector(event.detail.baseEvent.clientX, event.detail.baseEvent.clientY);
            let shiftPressed = false;

            // Preview drawing ellipse
            function preview(event: CustomMouseEvent): void {
                // Determine dimensions for an ellipse or circle (based on if shift is pressed)
                lastPosition = new Vector(event.detail.baseEvent.clientX, event.detail.baseEvent.clientY);
                const rawDimensions: Vector = start.towards(slideWrapper.getPosition(event));
                const minimumDimension: number = Math.min(Math.abs(rawDimensions.x), Math.abs(rawDimensions.y));
                const resolvedDimensions: Vector = event.detail.baseEvent.shiftKey ? rawDimensions.transform(Math.sign).scale(minimumDimension) : rawDimensions;

                // Enforce that a shape has positive width and height i.e. move the x and y if the width or height are negative
                ellipse.origin = start.add(resolvedDimensions.scale(0.5));
                ellipse.width = Math.abs(resolvedDimensions.x);
                ellipse.height = Math.abs(resolvedDimensions.y);
                slideWrapper.store.commit("updateGraphic", { slideId: slideWrapper.slideId, graphicId: ellipse.id, graphic: ellipse });
            }

            // End drawing ellipse
            function end(): void {
                document.removeEventListener("Deck.CanvasMouseMove", preview as EventListener);
                document.removeEventListener("Deck.CanvasMouseUp", end);
                document.removeEventListener("Deck.GraphicMouseUp", end);
                document.removeEventListener("keydown", toggleCircle);
                document.removeEventListener("keyup", toggleCircle);

                slideWrapper.store.commit("focusGraphic", { slideId: slideWrapper.store.getters.activeSlide.id, graphicId: ellipse.id });
                slideWrapper.store.commit("graphicEditorGraphicId", ellipse.id);
                slideWrapper.store.commit("addSnapVectors", { slideId: slideWrapper.store.getters.activeSlide.id, snapVectors: ellipse.getSnapVectors() });
                slideWrapper.store.commit("tool", "cursor");
                slideWrapper.setCursor("default");
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

    public canvasMouseOver(slideWrapper: ISlideWrapper): () => void {
        return (): void => slideWrapper.setCursor("crosshair");
    }

    public canvasMouseOut(slideWrapper: ISlideWrapper): () => void {
        return (): void => slideWrapper.setCursor("default");
    }

    public graphicMouseOver(slideWrapper: ISlideWrapper): () => void {
        return (): void => slideWrapper.setCursor("default");
    }
}
