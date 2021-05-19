import { IRectangleRenderer, ISlideRenderer } from '@/rendering/types';
import SVG from 'svg.js';
import { dispatch } from '..';
import { RectangleMouseEventPayload, RECTANGLE_EVENTS, SlideMouseEventPayload, SLIDE_EVENTS } from '../types';

export function decorateRectangleEvents(svg: SVG.Element, slide: ISlideRenderer, target: IRectangleRenderer) {
    svg.node.addEventListener('mouseup', baseEvent => {
        baseEvent.stopPropagation();
        dispatch<RectangleMouseEventPayload>(RECTANGLE_EVENTS.MOUSEUP, { type: RECTANGLE_EVENTS.MOUSEUP, slide, target, baseEvent });
        dispatch<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEUP, { type: SLIDE_EVENTS.MOUSEUP, slide, target, baseEvent });
    });

    svg.node.addEventListener('mousedown', baseEvent => {
        baseEvent.stopPropagation();
        dispatch<RectangleMouseEventPayload>(RECTANGLE_EVENTS.MOUSEDOWN, { type: RECTANGLE_EVENTS.MOUSEDOWN, slide, target, baseEvent });
        dispatch<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEDOWN, { type: SLIDE_EVENTS.MOUSEDOWN, slide, target, baseEvent });
    });

    svg.node.addEventListener('mouseover', baseEvent => {
        baseEvent.stopPropagation();
        dispatch<RectangleMouseEventPayload>(RECTANGLE_EVENTS.MOUSEOVER, { type: RECTANGLE_EVENTS.MOUSEOVER, slide, target, baseEvent });
        dispatch<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEOVER, { type: SLIDE_EVENTS.MOUSEOVER, slide, target, baseEvent });
    });

    svg.node.addEventListener('mouseleave', baseEvent => {
        baseEvent.stopPropagation();
        dispatch<RectangleMouseEventPayload>(RECTANGLE_EVENTS.MOUSEOUT, { type: RECTANGLE_EVENTS.MOUSEOUT, slide, target, baseEvent });
        dispatch<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEOUT, { type: SLIDE_EVENTS.MOUSEOUT, slide, target, baseEvent });
    });

    svg.node.addEventListener('mousemove', baseEvent => {
        baseEvent.stopPropagation();
        dispatch<RectangleMouseEventPayload>(RECTANGLE_EVENTS.MOUSEMOVE, { type: RECTANGLE_EVENTS.MOUSEMOVE, slide, target, baseEvent });
        dispatch<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEMOVE, { type: SLIDE_EVENTS.MOUSEMOVE, slide, target, baseEvent });
    });
}
