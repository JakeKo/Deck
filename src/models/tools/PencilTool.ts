import { CustomCanvasMouseEvent, CustomMouseEvent, ISlideWrapper } from '../../types';
import { Sketch } from '../graphics/graphics';
import CanvasTool from './CanvasTool';
import { EVENT_TYPES } from '../../constants';

export default class PencilTool extends CanvasTool {
    public canvasMouseDown(slideWrapper: ISlideWrapper): (event: CustomCanvasMouseEvent) => void {
        return function (event: CustomCanvasMouseEvent): void {
            // Create the sketch graphic
            const sketch: Sketch = new Sketch({ origin: slideWrapper.getPosition(event), fillColor: 'none', strokeColor: 'black', strokeWidth: 3 });

            // Clear the currently focused graphic and add the new sketch
            slideWrapper.focusGraphic(undefined);
            slideWrapper.store.commit('focusGraphic', { slideId: slideWrapper.store.getters.activeSlide.id, graphicId: undefined });
            slideWrapper.store.commit('graphicEditorGraphicId', undefined);
            slideWrapper.addGraphic(sketch);

            // Start listening to mouse events
            slideWrapper.addCanvasEventListener(EVENT_TYPES.CANVAS_MOUSE_MOVE, preview);
            slideWrapper.addCanvasEventListener(EVENT_TYPES.CANVAS_MOUSE_UP, end);

            function preview(event: CustomMouseEvent): void {
                // Add the current mouse position to the list of points to plot
                sketch.points.push(slideWrapper.getPosition(event).add(sketch.origin.scale(-1)));
                slideWrapper.updateGraphic(sketch.id, sketch);
            }

            function end(): void {
                // Unbind event handlers
                slideWrapper.removeCanvasEventListener(EVENT_TYPES.CANVAS_MOUSE_MOVE, preview);
                slideWrapper.removeCanvasEventListener(EVENT_TYPES.CANVAS_MOUSE_UP, end);

                // Persist the new sketch
                slideWrapper.focusGraphic(sketch);
                slideWrapper.store.commit('addGraphic', { slideId: slideWrapper.slideId, graphic: sketch });
                slideWrapper.store.commit('focusGraphic', { slideId: slideWrapper.slideId, graphicId: sketch.id });
                slideWrapper.store.commit('graphicEditorGraphicId', sketch.id);
                slideWrapper.store.commit('addSnapVectors', { slideId: slideWrapper.slideId, snapVectors: sketch.getSnapVectors() });
                slideWrapper.store.commit('tool', 'cursor');
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
