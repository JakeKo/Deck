import Vector from '../utilities/Vector';
import { CanvasRenderer } from './helpers';
import SlideRenderer from './SlideRenderer';

export function renderBackdrop(slideRenderer: SlideRenderer, width: number, height: number): void {
    new CanvasRenderer({
        slide: slideRenderer,
        origin: Vector.zero,
        width,
        height
    }).render();
}
