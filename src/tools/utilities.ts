import { ISlideRenderer } from '@/rendering/types';
import Vector from '@/utilities/Vector';

export function resolvePosition(event: MouseEvent, slide: ISlideRenderer): Vector {
    return new Vector(event.pageX, event.pageY)
        .scale(1 / slide.zoom)
        .add(slide.bounds.origin.scale(-1))
        .add(new Vector(slide.rawViewbox.x, slide.rawViewbox.y))
        .transform(Math.round);
}
