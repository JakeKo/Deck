import { RectangleRenderer } from '@/rendering/graphics';
import SlideRenderer from '@/rendering/SlideRenderer';
import SVG from 'svg.js';
import { RectangleMouseEvent, RectangleMouseEventPayload, RECTANGLE_EVENTS, SLIDE_EVENTS } from '../types';
import { dispatch, makeSlideMouseEvent } from '../utilities';

function makeRectangleMouseEvent(name: RECTANGLE_EVENTS, slide: SlideRenderer, target: RectangleRenderer, baseEvent: MouseEvent): RectangleMouseEvent {
    return new CustomEvent<RectangleMouseEventPayload>(name, { detail: { type: name, slide, target, baseEvent } });
}

export function decorateRectangleEvents(svg: SVG.Element, slide: SlideRenderer, graphic: RectangleRenderer) {
    svg.node.addEventListener('mouseup', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeRectangleMouseEvent(RECTANGLE_EVENTS.MOUSEUP, slide, graphic, baseEvent));
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEUP, slide, graphic, baseEvent));
    });

    svg.node.addEventListener('mousedown', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeRectangleMouseEvent(RECTANGLE_EVENTS.MOUSEDOWN, slide, graphic, baseEvent));
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEDOWN, slide, graphic, baseEvent));
    });

    svg.node.addEventListener('mouseover', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeRectangleMouseEvent(RECTANGLE_EVENTS.MOUSEOVER, slide, graphic, baseEvent));
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEOVER, slide, graphic, baseEvent));
    });

    svg.node.addEventListener('mouseleave', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeRectangleMouseEvent(RECTANGLE_EVENTS.MOUSEOUT, slide, graphic, baseEvent));
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEOUT, slide, graphic, baseEvent));
    });

    svg.node.addEventListener('mousemove', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeRectangleMouseEvent(RECTANGLE_EVENTS.MOUSEMOVE, slide, graphic, baseEvent));
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEMOVE, slide, graphic, baseEvent));
    });
}
