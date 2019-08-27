import { CustomCanvasMouseEvent, CustomMouseEvent, ISlideWrapper, IGraphic, BezierAnchorGraphics, CustomCanvasKeyboardEvent } from '../../types';
import { Curve } from '../graphics/graphics';
import Vector from '../Vector';
import CanvasTool from './CanvasTool';
import Utilities from '../../utilities';
import { EVENT_TYPES } from '../../constants';

export default class PenTool extends CanvasTool {
    private active: boolean = false;

    public canvasMouseDown(slideWrapper: ISlideWrapper): (event: CustomCanvasMouseEvent) => void {
        const self: PenTool = this;
        return function (event: CustomCanvasMouseEvent): void {
            // Prevent any action on canvas click if a bezier curve is being drawn
            if (self.active) { return; }
            else { self.active = true; }

            // Create some initial parameters for managing curve creation
            const anchorIds: Array<string> = [];
            const start: Vector = slideWrapper.getPosition(event);
            let segmentPoints: Array<Vector> = [Vector.undefined, Vector.undefined, Vector.undefined];
            const curve: Curve = new Curve({ origin: start, fillColor: 'none', strokeColor: 'black', strokeWidth: 3 });
            const segment: Curve = new Curve({ origin: start, points: resolveCurve(segmentPoints, new Vector(0, 0)), fillColor: 'none', strokeColor: 'black', strokeWidth: 3 });
            let anchorOrigin: Vector = start;

            // Clear the currently focused graphic and add the new curve
            slideWrapper.focusGraphic(undefined);
            slideWrapper.store.commit('focusGraphic', { slideId: slideWrapper.store.getters.activeSlide.id, graphicId: undefined });
            slideWrapper.store.commit('graphicEditorGraphicId', undefined);
            slideWrapper.addGraphic(segment);
            slideWrapper.addGraphic(curve);
            renderAnchorGraphics(start, start);

            // Start listening to canvas events
            slideWrapper.addCanvasEventListener(EVENT_TYPES.CANVAS_MOUSE_MOVE, preview);
            slideWrapper.addCanvasEventListener(EVENT_TYPES.CANVAS_MOUSE_UP, setFirstControlPoint);
            slideWrapper.addCanvasEventListener(EVENT_TYPES.CANVAS_KEY_DOWN, end);

            function setFirstControlPoint(event: CustomMouseEvent): void {
                slideWrapper.removeCanvasEventListener(EVENT_TYPES.CANVAS_MOUSE_UP, setFirstControlPoint);
                slideWrapper.addCanvasEventListener(EVENT_TYPES.CANVAS_MOUSE_DOWN, setEndpoint);

                segmentPoints[0] = segment.origin.towards(slideWrapper.getPosition(event));
                anchorOrigin = Vector.undefined;
            }

            function setEndpoint(event: CustomMouseEvent): void {
                slideWrapper.removeCanvasEventListener(EVENT_TYPES.CANVAS_MOUSE_DOWN, setEndpoint);
                slideWrapper.addCanvasEventListener(EVENT_TYPES.CANVAS_MOUSE_UP, setSecondControlPoint);

                const position: Vector = slideWrapper.getPosition(event);
                segmentPoints[2] = segment.origin.towards(position);
                anchorOrigin = position;
            }

            function setSecondControlPoint(event: CustomMouseEvent): void {
                slideWrapper.removeCanvasEventListener(EVENT_TYPES.CANVAS_MOUSE_UP, setSecondControlPoint);

                // Complete the curve segment and add it to the final curve
                segmentPoints[1] = segment.origin.towards(slideWrapper.getPosition(event)).reflect(segmentPoints[2]);
                curve.points.push(...segmentPoints.map((point: Vector): Vector => curve.origin.towards(segment.origin.add(point))));
                slideWrapper.updateGraphic(curve.id, curve);

                // Reset the curve segment and set the first control point
                segment.origin = segmentPoints[2].add(segment.origin);
                segmentPoints = [Vector.undefined, Vector.undefined, Vector.undefined];
                setFirstControlPoint(event);
            }

            function preview(event: CustomMouseEvent): void {
                // Redraw the current curve segment as the mouse moves around
                const position: Vector = slideWrapper.getPosition(event);
                segment.points = resolveCurve(segmentPoints, segment.origin.towards(position));
                slideWrapper.updateGraphic(segment.id, segment);

                removeAnchorGraphics();
                if (anchorOrigin !== Vector.undefined) {
                    renderAnchorGraphics(anchorOrigin, position);
                }
            }

            function end(event: CustomCanvasKeyboardEvent): void {
                // Check if the pressed key is not one of the specified keys to end the curve drawing
                if (['Escape', 'Enter', 'Tab'].indexOf(event.detail.baseEvent.key) === -1) {
                    return;
                }

                self.active = false;
                slideWrapper.removeGraphic(segment.id);

                // Remove all event handlers
                slideWrapper.removeCanvasEventListener(EVENT_TYPES.CANVAS_MOUSE_UP, setFirstControlPoint);
                slideWrapper.removeCanvasEventListener(EVENT_TYPES.CANVAS_MOUSE_DOWN, setEndpoint);
                slideWrapper.removeCanvasEventListener(EVENT_TYPES.CANVAS_MOUSE_UP, setSecondControlPoint);
                slideWrapper.removeCanvasEventListener(EVENT_TYPES.CANVAS_MOUSE_MOVE, preview);
                slideWrapper.removeCanvasEventListener(EVENT_TYPES.CANVAS_KEY_DOWN, end);

                // Persist the new curve
                slideWrapper.focusGraphic(curve);
                slideWrapper.store.commit('addGraphic', { slideId: slideWrapper.slideId, graphic: curve });
                slideWrapper.store.commit('focusGraphic', { slideId: slideWrapper.slideId, graphicId: curve.id });
                slideWrapper.store.commit('graphicEditorGraphicId', curve.id);
                slideWrapper.store.commit('addSnapVectors', { slideId: slideWrapper.slideId, snapVectors: curve.getSnapVectors() });
                slideWrapper.store.commit('tool', 'cursor');
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
                const anchorGraphics: BezierAnchorGraphics = Utilities.makeBezierCurvePointGraphic({ anchor: origin, firstHandle: position, secondHandle: position.reflect(origin) });
                const graphicList: Array<IGraphic> = [anchorGraphics.firstHandleTrace, anchorGraphics.secondHandleTrace!, anchorGraphics.anchor, anchorGraphics.firstHandle, anchorGraphics.secondHandle!];
                graphicList.forEach((anchorGraphic: IGraphic): void => slideWrapper.addGraphic(anchorGraphic));
                anchorIds.push(...graphicList.map<string>((anchorGraphic: IGraphic): string => anchorGraphic.id));
            }

            function removeAnchorGraphics(): void {
                anchorIds.forEach((anchorId: string): void => slideWrapper.removeGraphic(anchorId));
                anchorIds.length = 0;
            }
        };
    }

    public canvasMouseOver(slideWrapper: ISlideWrapper): () => void {
        return (): void => slideWrapper.setCursor('crosshair');
    }

    public canvasMouseOut(slideWrapper: ISlideWrapper): () => void {
        return (): void => slideWrapper.setCursor('default');
    }

    public graphicMouseOver(slideWrapper: ISlideWrapper): () => void {
        return (): void => slideWrapper.setCursor('crosshair');
    }
}
