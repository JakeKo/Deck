import { CustomCanvasMouseEvent, CustomMouseEvent, ISlideWrapper, CanvasMouseEvent, CustomCanvasKeyboardEvent } from '../../types';
import { EVENT_TYPES } from '../../constants';
import { Ellipse } from '../graphics/graphics';
import Vector from '../Vector';
import CanvasTool from './CanvasTool';

export default class EllipseTool extends CanvasTool {
    public canvasMouseDown(slideWrapper: ISlideWrapper): (event: CustomCanvasMouseEvent) => void {
        return function (event: CustomCanvasMouseEvent): void {
            // Create some initial parameters for managing ellipse creation
            const start: Vector = slideWrapper.getPosition(event);
            const ellipse: Ellipse = new Ellipse({ origin: start, fillColor: 'black', strokeColor: 'none', width: 1, height: 1 });
            let lastPosition: Vector = new Vector(event.detail.baseEvent.clientX, event.detail.baseEvent.clientY);
            let shiftPressed = false;

            // Clear the currently focused graphic and add the new ellipse
            slideWrapper.focusGraphic(undefined);
            slideWrapper.store.commit('focusGraphic', { slideId: slideWrapper.slideId, graphicId: undefined });
            slideWrapper.store.commit('graphicEditorGraphicId', undefined);
            slideWrapper.addGraphic(ellipse);

            // Start listening to mouse events
            slideWrapper.addCanvasEventListener(EVENT_TYPES.CANVAS_MOUSE_MOVE, preview as EventListener);
            slideWrapper.addCanvasEventListener(EVENT_TYPES.CANVAS_MOUSE_UP, end);
            slideWrapper.addCanvasEventListener(EVENT_TYPES.CANVAS_KEY_DOWN, toggleCircle as EventListener);
            slideWrapper.addCanvasEventListener(EVENT_TYPES.CANVAS_KEY_UP, toggleCircle as EventListener);

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
                slideWrapper.updateGraphic(ellipse.id, ellipse);
            }

            function end(): void {
                // Unbind event handlers
                slideWrapper.removeCanvasEventListener(EVENT_TYPES.CANVAS_MOUSE_MOVE, preview as EventListener);
                slideWrapper.removeCanvasEventListener(EVENT_TYPES.CANVAS_MOUSE_UP, end);
                slideWrapper.removeCanvasEventListener(EVENT_TYPES.CANVAS_KEY_DOWN, toggleCircle as EventListener);
                slideWrapper.removeCanvasEventListener(EVENT_TYPES.CANVAS_KEY_UP, toggleCircle as EventListener);

                // Persist the new ellipse
                slideWrapper.focusGraphic(ellipse);
                slideWrapper.store.commit('addGraphic', { slideId: slideWrapper.slideId, graphic: ellipse });
                slideWrapper.store.commit('focusGraphic', { slideId: slideWrapper.slideId, graphicId: ellipse.id });
                slideWrapper.store.commit('graphicEditorGraphicId', ellipse.id);
                slideWrapper.store.commit('addSnapVectors', { slideId: slideWrapper.slideId, snapVectors: ellipse.getSnapVectors() });
                slideWrapper.store.commit('tool', 'cursor');
                slideWrapper.setCursor('default');
            }

            function toggleCircle(event: CustomCanvasKeyboardEvent): void {
                if (event.detail.baseEvent.key !== 'Shift' || (event.detail.baseEvent.type === 'keydown' && shiftPressed)) {
                    return;
                }

                shiftPressed = event.detail.baseEvent.type === 'keydown';
                slideWrapper.dispatchEventOnCanvas<CanvasMouseEvent>(EVENT_TYPES.CANVAS_MOUSE_MOVE, {
                    baseEvent: new MouseEvent('mousemove', {
                        shiftKey: event.detail.baseEvent.type === 'keydown',
                        clientX: lastPosition.x,
                        clientY: lastPosition.y
                    }),
                    slideId: slideWrapper.slideId
                });
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
        return (): void => slideWrapper.setCursor('default');
    }
}
