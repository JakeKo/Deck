import ICanvasTool from "./ICanvasTool";
import Ellipse from "../graphics/Ellipse";
import Vector from "../Vector";
import SlideWrapper from "../../utilities/SlideWrapper";
import Utilities from "../../utilities/general";

export default class EllipseTool implements ICanvasTool {
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
            document.addEventListener("keydown", toggleCircle);
            document.addEventListener("keyup", toggleCircle);

            slideWrapper.store.commit("focusGraphic", { slideId: slideWrapper.store.getters.activeSlide.id, graphicId: undefined });
            slideWrapper.store.commit("styleEditorObject", undefined);

            const start: Vector = Utilities.getPosition(event, slideWrapper);
            const ellipse: Ellipse = new Ellipse({ origin: new Vector(start.x, start.y), fillColor: "black", strokeColor: "none", width: 1, height: 1 });
            slideWrapper.store.commit("addGraphic", { slideId: slideWrapper.slideId, graphic: ellipse });
            let lastPosition: Vector = new Vector((event.detail.baseEvent as MouseEvent).clientX, (event.detail.baseEvent as MouseEvent).clientY);
            let shiftPressed = false;

            // Preview drawing ellipse
            function preview(event: Event): void {
                // Determine dimensions for an ellipse or circle (based on if shift is pressed)
                const mouseEvent: MouseEvent = (event as CustomEvent).detail.baseEvent as MouseEvent;
                lastPosition = new Vector(mouseEvent.clientX, mouseEvent.clientY);

                const position: Vector = Utilities.getPosition(event as CustomEvent, slideWrapper);
                const rawOffset: Vector = position.add(start.scale(-1));
                const minimumOffset: number = Math.min(Math.abs(rawOffset.x), Math.abs(rawOffset.y));

                // Enforce that a shape has positive width and height i.e. move the x and y if the width or height are negative
                ellipse.origin.x = start.x + (mouseEvent.shiftKey ? Math.sign(rawOffset.x) * minimumOffset : rawOffset.x) * 0.5;
                ellipse.origin.y = start.y + (mouseEvent.shiftKey ? Math.sign(rawOffset.y) * minimumOffset : rawOffset.y) * 0.5;

                ellipse.width = mouseEvent.shiftKey ? minimumOffset : Math.abs(rawOffset.x);
                ellipse.height = mouseEvent.shiftKey ? minimumOffset : Math.abs(rawOffset.y);
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
            }

            function toggleCircle(event: KeyboardEvent): void {
                if (event.key !== "Shift" || (event.type === "keydown" && shiftPressed)) {
                    return;
                }

                shiftPressed = event.type === "keydown";
                document.dispatchEvent(new CustomEvent("Deck.CanvasMouseMove", {
                    detail: {
                        baseEvent: new MouseEvent("mousemove", {
                            shiftKey: event.type === "keydown",
                            clientX: lastPosition.x,
                            clientY: lastPosition.y
                        }),
                        slideId: slideWrapper.slideId
                    }
                }));
            }
        };
    }

    public canvasMouseOver(slideWrapper: SlideWrapper): () => void {
        const self: EllipseTool = this;
        return function () {
            slideWrapper.setCursor(self.cursor);
        };
    }

    public canvasMouseOut(slideWrapper: SlideWrapper): () => void {
        const self: EllipseTool = this;
        return function () {
            slideWrapper.setCursor(self.defaultCursor);
        };
    }

    public graphicMouseOver(slideWrapper: SlideWrapper): () => void {
        const self: EllipseTool = this;
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
