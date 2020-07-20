import * as SVG from 'svg.js';
import SlideRenderer from "../../rendering/SlideRenderer";
import { SLIDE_EVENTS, VertexMouseEvent, VertexMouseEventPayload, VERTEX_EVENTS } from "../types";
import { dispatch, makeSlideMouseEvent } from "../utilities";

function makeVertexMouseEvent(name: VERTEX_EVENTS, slide: SlideRenderer, location: string, baseEvent: MouseEvent): VertexMouseEvent {
    return new CustomEvent<VertexMouseEventPayload>(name, { detail: { type: name, slide, location, baseEvent } });
}

export function decorateVertexEvents(svg: SVG.Element, slide: SlideRenderer, location: string): void {
    svg.node.addEventListener('mouseup', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeVertexMouseEvent(VERTEX_EVENTS.MOUSEUP, slide, location, baseEvent));
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEUP, slide, undefined, baseEvent));
    });

    svg.node.addEventListener('mousedown', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeVertexMouseEvent(VERTEX_EVENTS.MOUSEDOWN, slide, location, baseEvent));
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEDOWN, slide, undefined, baseEvent));
    });

    svg.node.addEventListener('mouseover', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeVertexMouseEvent(VERTEX_EVENTS.MOUSEOVER, slide, location, baseEvent));
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEOVER, slide, undefined, baseEvent));
    });

    svg.node.addEventListener('mouseleave', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeVertexMouseEvent(VERTEX_EVENTS.MOUSEOUT, slide, location, baseEvent));
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEOUT, slide, undefined, baseEvent));
    });

    svg.node.addEventListener('mousemove', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeVertexMouseEvent(VERTEX_EVENTS.MOUSEMOVE, slide, location, baseEvent));
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEMOVE, slide, undefined, baseEvent));
    });
}
