import ICanvasTool from "./ICanvasTool";
import Curve from "../graphics/Curve";
import Point from "../Point";
import Sketch from "../graphics/Sketch";
import SlideWrapper from "../../utilities/SlideWrapper";
import Utilities from "../../utilities/general";

export default class PenTool implements ICanvasTool {
    public name: string;

    private _active: boolean;
    private noop: () => void = (): void => { return; };
    private cursor: string = "crosshair";
    private defaultCursor: string = "default";

    constructor(name: string) {
        this.name = name;
        this._active = false;
    }

    public canvasMouseDown(slideWrapper: SlideWrapper): (event: CustomEvent) => void {
        const self: PenTool = this;
        return function (event: CustomEvent): void {
            // Prevent any action on canvas click if a bezier curve is being drawn
            if (self._active) { return; }
            else { self._active = true; }

            document.addEventListener("keydown", end);
            document.addEventListener("Deck.CanvasMouseMove", preview);
            document.addEventListener("Deck.CanvasMouseUp", setFirstControlPoint);
            document.addEventListener("Deck.GraphicMouseUp", setFirstControlPoint);

            slideWrapper.focusGraphic(undefined);
            slideWrapper.store.commit("focusGraphic", undefined);
            slideWrapper.store.commit("styleEditorObject", undefined);

            // Create SVGs for the primary curve, the editable curve segment, and the control point preview
            const start: Point = Utilities.getPosition(event, slideWrapper.store);
            const resolution: number = slideWrapper.store.getters.canvasResolution;

            let segmentPoints: Array<Point> = [Point.undefined, Point.undefined, Point.undefined];
            const curve: Curve = new Curve({ origin: start, fillColor: "none", strokeColor: "black", strokeWidth: resolution * 3 });
            const segment: Curve = new Curve({ origin: start, points: resolveCurve(segmentPoints, new Point(0, 0)), fillColor: "none", strokeColor: "black", strokeWidth: resolution * 3 });
            const handle: Sketch = new Sketch({ fillColor: "none", strokeColor: "blue", strokeWidth: resolution });

            slideWrapper.addGraphic(curve);
            slideWrapper.addGraphic(segment);
            slideWrapper.addGraphic(handle);

            function setFirstControlPoint(event: Event): void {
                document.removeEventListener("Deck.CanvasMouseUp", setFirstControlPoint);
                document.removeEventListener("Deck.GraphicMouseUp", setFirstControlPoint);
                document.addEventListener("Deck.CanvasMouseDown", setEndpoint);
                document.addEventListener("Deck.GraphicMouseDown", setEndpoint);

                segmentPoints[0] = Utilities.getPosition(event as CustomEvent, slideWrapper.store).add(segment.origin.scale(-1));
            }

            function setEndpoint(event: Event): void {
                document.removeEventListener("Deck.CanvasMouseDown", setEndpoint);
                document.removeEventListener("Deck.GraphicMouseDown", setEndpoint);
                document.addEventListener("Deck.CanvasMouseUp", setSecondControlPoint);
                document.addEventListener("Deck.GraphicMouseUp", setSecondControlPoint);

                segmentPoints[2] = Utilities.getPosition(event as CustomEvent, slideWrapper.store).add(segment.origin.scale(-1));
            }

            function setSecondControlPoint(event: Event): void {
                document.removeEventListener("Deck.CanvasMouseUp", setSecondControlPoint);
                document.removeEventListener("Deck.GraphicMouseUp", setSecondControlPoint);

                // Complete the curve segment and add it to the final curve
                segmentPoints[1] = Utilities.getPosition(event as CustomEvent, slideWrapper.store).add(segment.origin.scale(-1)).reflect(segmentPoints[2]);
                curve.points.push(...segmentPoints);

                // Reset the curve segment and set the first control point
                segment.origin = segmentPoints[2].add(segment.origin);
                segmentPoints = [Point.undefined, Point.undefined, Point.undefined];
                setFirstControlPoint(event);
            }

            function preview(event: Event): void {
                // Redraw the current curve segment as the mouse moves around
                const position: Point = Utilities.getPosition(event as CustomEvent, slideWrapper.store);
                segment.points = resolveCurve(segmentPoints, position.add(segment.origin.scale(-1)));
                slideWrapper.updateGraphic(segment.id, segment);
                slideWrapper.updateGraphic(curve.id, curve);

                // Display the control point shape if the endpoint is defined
                if (segmentPoints[2] !== Point.undefined) {
                    handle.origin = position;
                    handle.points = [position.reflect(segment.points[2].add(segment.origin)).add(position.scale(-1))];
                    handle.strokeColor = "blue";
                } else {
                    handle.strokeColor = "none";
                }

                slideWrapper.updateGraphic(handle.id, handle);
            }

            function end(event: KeyboardEvent): void {
                // Check if the pressed key is not one of the specified keys to end the curve drawing
                if (["Escape", "Enter", "Tab"].indexOf(event.key) === -1) {
                    return;
                }

                self._active = false;
                slideWrapper.removeGraphic(handle.id);
                slideWrapper.removeGraphic(segment.id);
                document.removeEventListener("keydown", end);
                document.removeEventListener("Deck.CanvasMouseMove", preview);

                slideWrapper.store.commit("addGraphic", { slideId: slideWrapper.slideId, graphic: curve });
                slideWrapper.store.commit("focusGraphic", curve);
                slideWrapper.store.commit("styleEditorObject", curve);
                slideWrapper.focusGraphic(curve.id);
            }

            // Convert a curve with possible undefined values to a curve with defined fallback values
            function resolveCurve(curve: Array<Point>, defaultPoint: Point): Array<Point> {
                return [
                    curve[0] === Point.undefined ? defaultPoint : curve[0],
                    curve[1] === Point.undefined ? (curve[2] !== Point.undefined ? defaultPoint.reflect(curve[2]) : defaultPoint) : curve[1],
                    curve[2] === Point.undefined ? defaultPoint : curve[2],
                ];
            }
        };
    }

    public canvasMouseOver(slideWrapper: SlideWrapper): () => void {
        const self: PenTool = this;
        return function () {
            slideWrapper.setCursor(self.cursor);
        };
    }

    public canvasMouseOut(slideWrapper: SlideWrapper): () => void {
        const self: PenTool = this;
        return function () {
            slideWrapper.setCursor(self.defaultCursor);
        };
    }

    public graphicMouseOver(slideWrapper: SlideWrapper): () => void {
        const self: PenTool = this;
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
