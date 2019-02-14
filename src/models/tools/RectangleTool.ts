import ICanvasTool from "./ICanvasTool";
import Rectangle from "../graphics/Rectangle";
import Point from "../Point";
import SlideWrapper from "../../utilities/SlideWrapper";
import Utilities from "../../utilities/general";

export default class RectangleTool implements ICanvasTool {
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
            document.addEventListener("keydown", toggleSquare);
            document.addEventListener("keyup", toggleSquare);

            slideWrapper.store.commit("focusGraphic", undefined);
            slideWrapper.store.commit("styleEditorObject", undefined);
            const start: Point = Utilities.getPosition(event, slideWrapper.store);
            const rectangle: Rectangle = new Rectangle({ origin: new Point(start.x, start.y), fillColor: "black", strokeColor: "none", width: 1, height: 1 });
            slideWrapper.addGraphic(rectangle);
            let lastPosition: Point = new Point((event.detail.baseEvent as MouseEvent).clientX, (event.detail.baseEvent as MouseEvent).clientY);
            let shiftPressed = false;

            // Preview drawing rectangle
            function preview(event: Event): void {
                // Determine dimensions for a rectangle or square (based on if shift is pressed)
                const mouseEvent: MouseEvent = (event as CustomEvent).detail.baseEvent as MouseEvent;
                lastPosition = new Point(mouseEvent.clientX, mouseEvent.clientY);

                const position: Point = Utilities.getPosition(event as CustomEvent, slideWrapper.store);
                const rawDimensions: Point = position.add(start.scale(-1));
                const minimumDimension: number = Math.min(Math.abs(rawDimensions.x), Math.abs(rawDimensions.y));

                // Enforce that a shape has positive width and height i.e. move the x and y if the width or height are negative
                rectangle.origin.x = rawDimensions.x < 0 ? start.x + (mouseEvent.shiftKey ? -minimumDimension : rawDimensions.x) : rectangle.origin.x;
                rectangle.origin.y = rawDimensions.y < 0 ? start.y + (mouseEvent.shiftKey ? -minimumDimension : rawDimensions.y) : rectangle.origin.y;

                rectangle.width = mouseEvent.shiftKey ? minimumDimension : Math.abs(rawDimensions.x);
                rectangle.height = mouseEvent.shiftKey ? minimumDimension : Math.abs(rawDimensions.y);
                slideWrapper.updateGraphic(rectangle.id, rectangle);
            }

            // End drawing rectangle
            function end(): void {
                document.removeEventListener("Deck.CanvasMouseMove", preview);
                document.removeEventListener("Deck.CanvasMouseUp", end);
                document.removeEventListener("Deck.GraphicMouseUp", end);
                document.removeEventListener("keydown", toggleSquare);
                document.removeEventListener("keyup", toggleSquare);

                slideWrapper.store.commit("addGraphic", { slideId: slideWrapper.slideId, graphic: rectangle });
                slideWrapper.store.commit("focusGraphic", rectangle);
                slideWrapper.store.commit("styleEditorObject", rectangle);
                slideWrapper.focusGraphic(rectangle.id);
            }

            function toggleSquare(event: KeyboardEvent): void {
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
        const self: RectangleTool = this;
        return function () {
            slideWrapper.setCursor(self.cursor);
        };
    }

    public canvasMouseOut(slideWrapper: SlideWrapper): () => void {
        const self: RectangleTool = this;
        return function () {
            slideWrapper.setCursor(self.defaultCursor);
        };
    }

    public graphicMouseOver(): () => void {
        return this.noop;
    }

    public graphicMouseOut(): () => void {
        return this.noop;
    }

    public graphicMouseDown(): () => void {
        return this.noop;
    }
}
