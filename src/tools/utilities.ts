import { ISlideRenderer } from '@/rendering/types';
import V from '@/utilities/Vector';

export function resolvePosition(event: MouseEvent, slide: ISlideRenderer): V {
    return new V(event.pageX, event.pageY)
        .scale(1 / slide.zoom)
        .add(slide.bounds.origin.scale(-1))
        .add(new V(slide.rawViewbox.x, slide.rawViewbox.y))
        .apply(Math.round);
}
