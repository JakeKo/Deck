import { CustomCanvasMouseEvent, CustomMouseEvent, ISlideWrapper, IGraphic } from "../../types";
import { Curve } from "../graphics/graphics";
import Vector from "../Vector";
import CanvasTool from "./CanvasTool";
import Utilities from "../../utilities";

export default class PenTool extends CanvasTool {
    private active: boolean = false;

    public canvasMouseDown(slideWrapper: ISlideWrapper): (event: CustomCanvasMouseEvent) => void {
        const self: PenTool = this;
        return function (event: CustomCanvasMouseEvent): void {
            // Prevent any action on canvas click if a bezier curve is being drawn
            if (self.active) { return; }
            else { self.active = true; }

            document.addEventListener("keydown", end);
            document.addEventListener("Deck.CanvasMouseMove", preview as EventListener);
            document.addEventListener("Deck.CanvasMouseUp", setFirstControlPoint as EventListener);
            document.addEventListener("Deck.GraphicMouseUp", setFirstControlPoint as EventListener);

            slideWrapper.store.commit("focusGraphic", { slideId: slideWrapper.store.getters.activeSlide.id, graphicId: undefined });
            slideWrapper.store.commit("graphicEditorGraphicId", undefined);

            // Create SVGs for the primary curve, the editable curve segment, and the control point preview
            const anchorIds: Array<string> = [];
            const start: Vector = slideWrapper.getPosition(event);
            let segmentPoints: Array<Vector> = [Vector.undefined, Vector.undefined, Vector.undefined];
            const curve: Curve = new Curve({ origin: start, fillColor: "none", strokeColor: "black", strokeWidth: 3 });
            const segment: Curve = new Curve({ origin: start, points: resolveCurve(segmentPoints, new Vector(0, 0)), fillColor: "none", strokeColor: "black", strokeWidth: 3 });
            renderAnchorGraphics(start, start);

            // Only add the curve to the store - not the preview segment or handle preview
            slideWrapper.store.commit("addGraphic", { slideId: slideWrapper.slideId, graphic: curve });
            slideWrapper.addGraphic(segment);

            let anchorOrigin: Vector = start;

            function setFirstControlPoint(event: CustomMouseEvent): void {
                document.removeEventListener("Deck.CanvasMouseUp", setFirstControlPoint as EventListener);
                document.removeEventListener("Deck.GraphicMouseUp", setFirstControlPoint as EventListener);
                document.addEventListener("Deck.CanvasMouseDown", setEndpoint as EventListener);
                document.addEventListener("Deck.GraphicMouseDown", setEndpoint as EventListener);

                segmentPoints[0] = slideWrapper.getPosition(event).add(segment.origin.scale(-1));
                anchorOrigin = Vector.undefined;
            }

            function setEndpoint(event: CustomMouseEvent): void {
                document.removeEventListener("Deck.CanvasMouseDown", setEndpoint as EventListener);
                document.removeEventListener("Deck.GraphicMouseDown", setEndpoint as EventListener);
                document.addEventListener("Deck.CanvasMouseUp", setSecondControlPoint as EventListener);
                document.addEventListener("Deck.GraphicMouseUp", setSecondControlPoint as EventListener);

                const position: Vector = slideWrapper.getPosition(event);
                segmentPoints[2] = position.add(segment.origin.scale(-1));
                anchorOrigin = position;
            }

            function setSecondControlPoint(event: CustomMouseEvent): void {
                document.removeEventListener("Deck.CanvasMouseUp", setSecondControlPoint as EventListener);
                document.removeEventListener("Deck.GraphicMouseUp", setSecondControlPoint as EventListener);

                // Complete the curve segment and add it to the final curve
                segmentPoints[1] = slideWrapper.getPosition(event).add(segment.origin.scale(-1)).reflect(segmentPoints[2]);
                curve.points.push(...segmentPoints);

                // Reset the curve segment and set the first control point
                segment.origin = segmentPoints[2].add(segment.origin);
                segmentPoints = [Vector.undefined, Vector.undefined, Vector.undefined];
                setFirstControlPoint(event);
            }

            function preview(event: CustomMouseEvent): void {
                // Redraw the current curve segment as the mouse moves around
                const position: Vector = slideWrapper.getPosition(event);
                segment.points = resolveCurve(segmentPoints, position.add(segment.origin.scale(-1)));
                slideWrapper.store.commit("updateGraphic", { slideId: slideWrapper.slideId, graphicId: curve.id, graphic: curve });
                slideWrapper.updateGraphic(segment.id, segment);

                removeAnchorGraphics();
                if (anchorOrigin !== Vector.undefined) {
                    renderAnchorGraphics(anchorOrigin, position);
                }
            }

            function end(event: KeyboardEvent): void {
                // Check if the pressed key is not one of the specified keys to end the curve drawing
                if (["Escape", "Enter", "Tab"].indexOf(event.key) === -1) {
                    return;
                }

                self.active = false;
                slideWrapper.removeGraphic(segment.id);

                // Remove all event handlers
                document.removeEventListener("keydown", end);
                document.removeEventListener("Deck.CanvasMouseUp", setFirstControlPoint as EventListener);
                document.removeEventListener("Deck.GraphicMouseUp", setFirstControlPoint as EventListener);
                document.removeEventListener("Deck.CanvasMouseDown", setEndpoint as EventListener);
                document.removeEventListener("Deck.GraphicMouseDown", setEndpoint as EventListener);
                document.removeEventListener("Deck.CanvasMouseUp", setSecondControlPoint as EventListener);
                document.removeEventListener("Deck.GraphicMouseUp", setSecondControlPoint as EventListener);
                document.removeEventListener("Deck.CanvasMouseMove", preview as EventListener);

                slideWrapper.store.commit("focusGraphic", { slideId: slideWrapper.store.getters.activeSlide.id, graphicId: curve.id });
                slideWrapper.store.commit("graphicEditorGraphicId", curve.id);
                slideWrapper.store.commit("addSnapVectors", { slideId: slideWrapper.store.getters.activeSlide.id, snapVectors: curve.getSnapVectors() });
                slideWrapper.store.commit("tool", "cursor");
                slideWrapper.setCursor("default");
            }

            // Convert a curve with possible undefined values to a curve with defined fallback values
            function resolveCurve(curve: Array<Vector>, defaultPoint: Vector): Array<Vector> {
                return [
                    curve[0] === Vector.undefined ? defaultPoint : curve[0],
                    curve[1] === Vector.undefined ? (curve[2] !== Vector.undefined ? defaultPoint.reflect(curve[2]) : defaultPoint) : curve[1],
                    curve[2] === Vector.undefined ? defaultPoint : curve[2],
                ];
            }

            function renderAnchorGraphics(origin: Vector, position: Vector): void {
                const anchorGraphics: Array<IGraphic> = Utilities.makeBezierCurvePointGraphic(origin, position, position.reflect(origin));
                anchorGraphics.forEach((anchorGraphic: IGraphic): void => slideWrapper.addGraphic(anchorGraphic));
                anchorIds.push(...anchorGraphics.map<string>((anchorGraphic: IGraphic): string => anchorGraphic.id));
            }

            function removeAnchorGraphics(): void {
                anchorIds.forEach((anchorId: string): void => slideWrapper.removeGraphic(anchorId));
                anchorIds.length = 0;
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
