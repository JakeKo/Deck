import { IRotatorRenderer, ISlideRenderer } from '@/rendering/types';
import SVG from 'svg.js';
import { dispatch } from '..';
import { RotatorMouseEventPayload, ROTATOR_EVENTS, SlideMouseEventPayload, SLIDE_EVENTS } from '../types';

export function decorateRotatorEvents(svg: SVG.Element, slide: ISlideRenderer, target: IRotatorRenderer): void {
    svg.node.addEventListener('mouseup', baseEvent => {
        baseEvent.stopPropagation();
        dispatch<RotatorMouseEventPayload>(ROTATOR_EVENTS.MOUSEUP, { type: ROTATOR_EVENTS.MOUSEUP, slide, parentId: target.parent.id, baseEvent });
        dispatch<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEUP, { type: SLIDE_EVENTS.MOUSEUP, slide, target, baseEvent });
    });

    svg.node.addEventListener('mousedown', baseEvent => {
        baseEvent.stopPropagation();
        dispatch<RotatorMouseEventPayload>(ROTATOR_EVENTS.MOUSEDOWN, { type: ROTATOR_EVENTS.MOUSEDOWN, slide, parentId: target.parent.id, baseEvent });
        dispatch<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEDOWN, { type: SLIDE_EVENTS.MOUSEDOWN, slide, target, baseEvent });
    });

    svg.node.addEventListener('mouseover', baseEvent => {
        baseEvent.stopPropagation();
        dispatch<RotatorMouseEventPayload>(ROTATOR_EVENTS.MOUSEOVER, { type: ROTATOR_EVENTS.MOUSEOVER, slide, parentId: target.parent.id, baseEvent });
        dispatch<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEOVER, { type: SLIDE_EVENTS.MOUSEOVER, slide, target, baseEvent });
    });

    svg.node.addEventListener('mouseleave', baseEvent => {
        baseEvent.stopPropagation();
        dispatch<RotatorMouseEventPayload>(ROTATOR_EVENTS.MOUSEOUT, { type: ROTATOR_EVENTS.MOUSEOUT, slide, parentId: target.parent.id, baseEvent });
        dispatch<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEOUT, { type: SLIDE_EVENTS.MOUSEOUT, slide, target, baseEvent });
    });

    svg.node.addEventListener('mousemove', baseEvent => {
        baseEvent.stopPropagation();
        dispatch<RotatorMouseEventPayload>(ROTATOR_EVENTS.MOUSEMOVE, { type: ROTATOR_EVENTS.MOUSEMOVE, slide, parentId: target.parent.id, baseEvent });
        dispatch<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEMOVE, { type: SLIDE_EVENTS.MOUSEMOVE, slide, target, baseEvent });
    });
}
