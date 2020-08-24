import SlideRenderer from '../rendering/SlideRenderer';
import Vector from '@/utilities/Vector';

export function resolvePosition(event: MouseEvent, slideRenderer: SlideRenderer): Vector {
    return new Vector(event.pageX, event.pageY)
        .scale(1 / slideRenderer.zoom)
        .add(slideRenderer.bounds.origin.scale(-1))
        .add(new Vector(slideRenderer.rawViewbox.x, slideRenderer.rawViewbox.y))
        .transform(Math.round);
}
