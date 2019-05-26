import ICanvasTool from "./ICanvasTool";
import Curve from "../graphics/Curve";
import Vector from "../Vector";
import Sketch from "../graphics/Sketch";
import SlideWrapper from "../../utilities/SlideWrapper";
import CanvasMouseEvent from "../CanvasMouseEvent";
import GraphicMouseEvent from "../GraphicMouseEvent";

export default class PenTool implements ICanvasTool {
    private active: boolean = false;

    public canvasMouseDown(slideWrapper: SlideWrapper): (event: CustomEvent<CanvasMouseEvent>) => void {
        const self: PenTool = this;
        return function (event: CustomEvent<CanvasMouseEvent>): void {
            // Prevent any action on canvas click if a bezier curve is being drawn
            if (self.active) { return; }
            else { self.active = true; }

            document.addEventListener("keydown", end);
            document.addEventListener("Deck.CanvasMouseMove", preview);
            document.addEventListener("Deck.CanvasMouseUp", setFirstControlPoint);
            document.addEventListener("Deck.GraphicMouseUp", setFirstControlPoint);

            slideWrapper.store.commit("focusGraphic", { slideId: slideWrapper.store.getters.activeSlide.id, graphicId: undefined });
            slideWrapper.store.commit("styleEditorObject", undefined);

            // Create SVGs for the primary curve, the editable curve segment, and the control point preview
            const start: Vector = slideWrapper.getPosition(event);
            const resolution: number = slideWrapper.store.getters.canvasResolution;

            let segmentPoints: Array<Vector> = [Vector.undefined, Vector.undefined, Vector.undefined];
            const curve: Curve = new Curve({ origin: start, fillColor: "none", strokeColor: "black", strokeWidth: resolution * 3 });
            const segment: Curve = new Curve({ origin: start, points: resolveCurve(segmentPoints, new Vector(0, 0)), fillColor: "none", strokeColor: "black", strokeWidth: resolution * 3 });
            const handle: Sketch = new Sketch({ fillColor: "none", strokeColor: "blue", strokeWidth: resolution });

            // Only add the curve to the store - not the preview segment or handle preview
            slideWrapper.store.commit("addGraphic", { slideId: slideWrapper.slideId, graphic: curve });
            slideWrapper.addGraphic(segment);
            slideWrapper.addGraphic(handle);

            function setFirstControlPoint(event: Event): void {
                document.removeEventListener("Deck.CanvasMouseUp", setFirstControlPoint);
                document.removeEventListener("Deck.GraphicMouseUp", setFirstControlPoint);
                document.addEventListener("Deck.CanvasMouseDown", setEndpoint);
                document.addEventListener("Deck.GraphicMouseDown", setEndpoint);

                segmentPoints[0] = slideWrapper.getPosition(event as CustomEvent<GraphicMouseEvent | CanvasMouseEvent>).add(segment.origin.scale(-1));
            }

            function setEndpoint(event: Event): void {
                document.removeEventListener("Deck.CanvasMouseDown", setEndpoint);
                document.removeEventListener("Deck.GraphicMouseDown", setEndpoint);
                document.addEventListener("Deck.CanvasMouseUp", setSecondControlPoint);
                document.addEventListener("Deck.GraphicMouseUp", setSecondControlPoint);

                segmentPoints[2] = slideWrapper.getPosition(event as CustomEvent<GraphicMouseEvent | CanvasMouseEvent>).add(segment.origin.scale(-1));
            }

            function setSecondControlPoint(event: Event): void {
                document.removeEventListener("Deck.CanvasMouseUp", setSecondControlPoint);
                document.removeEventListener("Deck.GraphicMouseUp", setSecondControlPoint);

                // Complete the curve segment and add it to the final curve
                segmentPoints[1] = slideWrapper.getPosition(event as CustomEvent<GraphicMouseEvent | CanvasMouseEvent>).add(segment.origin.scale(-1)).reflect(segmentPoints[2]);
                curve.points.push(...segmentPoints);

                // Reset the curve segment and set the first control point
                segment.origin = segmentPoints[2].add(segment.origin);
                segmentPoints = [Vector.undefined, Vector.undefined, Vector.undefined];
                setFirstControlPoint(event);
            }

            function preview(event: Event): void {
                // Redraw the current curve segment as the mouse moves around
                const position: Vector = slideWrapper.getPosition(event as CustomEvent<GraphicMouseEvent | CanvasMouseEvent>);
                segment.points = resolveCurve(segmentPoints, position.add(segment.origin.scale(-1)));
                slideWrapper.store.commit("updateGraphic", { slideId: slideWrapper.slideId, graphicId: curve.id, graphic: curve });
                slideWrapper.updateGraphic(segment.id, segment);

                // Display the control point shape if the endpoint is defined
                if (segmentPoints[2] !== Vector.undefined) {
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

                self.active = false;
                slideWrapper.removeGraphic(handle.id);
                slideWrapper.removeGraphic(segment.id);

                // Remove all event handlers
                document.removeEventListener("keydown", end);
                document.removeEventListener("Deck.CanvasMouseUp", setFirstControlPoint);
                document.removeEventListener("Deck.GraphicMouseUp", setFirstControlPoint);
                document.removeEventListener("Deck.CanvasMouseDown", setEndpoint);
                document.removeEventListener("Deck.GraphicMouseDown", setEndpoint);
                document.removeEventListener("Deck.CanvasMouseUp", setSecondControlPoint);
                document.removeEventListener("Deck.GraphicMouseUp", setSecondControlPoint);
                document.removeEventListener("Deck.CanvasMouseMove", preview);

                slideWrapper.store.commit("focusGraphic", { slideId: slideWrapper.store.getters.activeSlide.id, graphicId: curve.id });
                slideWrapper.store.commit("styleEditorObject", curve);
                slideWrapper.store.commit("addSnapVectors", { slideId: slideWrapper.store.getters.activeSlide.id, snapVectors: curve.getSnapVectors() });
                slideWrapper.store.commit("tool", "cursor");
            }

            // Convert a curve with possible undefined values to a curve with defined fallback values
            function resolveCurve(curve: Array<Vector>, defaultPoint: Vector): Array<Vector> {
                return [
                    curve[0] === Vector.undefined ? defaultPoint : curve[0],
                    curve[1] === Vector.undefined ? (curve[2] !== Vector.undefined ? defaultPoint.reflect(curve[2]) : defaultPoint) : curve[1],
                    curve[2] === Vector.undefined ? defaultPoint : curve[2],
                ];
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
