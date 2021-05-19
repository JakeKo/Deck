import { ISlideRenderer, IVertexRenderer } from '@/rendering/types';
import SVG from 'svg.js';
import { dispatch } from '..';
import { SlideMouseEventPayload, SLIDE_EVENTS, VertexMouseEventPayload, VERTEX_EVENTS } from '../types';

export function decorateVertexEvents(svg: SVG.Element, slide: ISlideRenderer, target: IVertexRenderer): void {
    svg.node.addEventListener('mouseup', baseEvent => {
        baseEvent.stopPropagation();
        dispatch<VertexMouseEventPayload>(VERTEX_EVENTS.MOUSEUP, { type: VERTEX_EVENTS.MOUSEUP, slide, target, baseEvent });
        dispatch<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEUP, { type: SLIDE_EVENTS.MOUSEUP, slide, target, baseEvent });
    });

    svg.node.addEventListener('mousedown', baseEvent => {
        baseEvent.stopPropagation();
        dispatch<VertexMouseEventPayload>(VERTEX_EVENTS.MOUSEDOWN, { type: VERTEX_EVENTS.MOUSEDOWN, slide, target, baseEvent });
        dispatch<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEDOWN, { type: SLIDE_EVENTS.MOUSEUP, slide, target, baseEvent });
    });

    svg.node.addEventListener('mouseover', baseEvent => {
        baseEvent.stopPropagation();
        dispatch<VertexMouseEventPayload>(VERTEX_EVENTS.MOUSEOVER, { type: VERTEX_EVENTS.MOUSEOVER, slide, target, baseEvent });
        dispatch<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEOVER, { type: SLIDE_EVENTS.MOUSEUP, slide, target, baseEvent });
    });

    svg.node.addEventListener('mouseleave', baseEvent => {
        baseEvent.stopPropagation();
        dispatch<VertexMouseEventPayload>(VERTEX_EVENTS.MOUSEOUT, { type: VERTEX_EVENTS.MOUSEOUT, slide, target, baseEvent });
        dispatch<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEOUT, { type: SLIDE_EVENTS.MOUSEUP, slide, target, baseEvent });
    });

    svg.node.addEventListener('mousemove', baseEvent => {
        baseEvent.stopPropagation();
        dispatch<VertexMouseEventPayload>(VERTEX_EVENTS.MOUSEMOVE, { type: VERTEX_EVENTS.MOUSEMOVE, slide, target, baseEvent });
        dispatch<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEMOVE, { type: SLIDE_EVENTS.MOUSEUP, slide, target, baseEvent });
    });
}
