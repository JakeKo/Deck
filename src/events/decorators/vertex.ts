import * as SVG from 'svg.js';
import SlideRenderer from "../../rendering/SlideRenderer";
import { SLIDE_EVENTS, VertexMouseEvent, VertexMouseEventPayload, VERTEX_EVENTS } from "../types";
import { dispatch, makeSlideMouseEvent } from "../utilities";
import { VertexRenderer } from '../../rendering/helpers';

function makeVertexMouseEvent(name: VERTEX_EVENTS, slide: SlideRenderer, graphic: VertexRenderer, baseEvent: MouseEvent): VertexMouseEvent {
    return new CustomEvent<VertexMouseEventPayload>(name, { detail: { type: name, slide, graphic, baseEvent } });
}

export function decorateVertexEvents(svg: SVG.Element, slide: SlideRenderer, graphic: VertexRenderer): void {
    svg.node.addEventListener('mouseup', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeVertexMouseEvent(VERTEX_EVENTS.MOUSEUP, slide, graphic, baseEvent));
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEUP, slide, undefined, baseEvent));
    });

    svg.node.addEventListener('mousedown', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeVertexMouseEvent(VERTEX_EVENTS.MOUSEDOWN, slide, graphic, baseEvent));
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEDOWN, slide, undefined, baseEvent));
    });

    svg.node.addEventListener('mouseover', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeVertexMouseEvent(VERTEX_EVENTS.MOUSEOVER, slide, graphic, baseEvent));
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEOVER, slide, undefined, baseEvent));
    });

    svg.node.addEventListener('mouseleave', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeVertexMouseEvent(VERTEX_EVENTS.MOUSEOUT, slide, graphic, baseEvent));
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEOUT, slide, undefined, baseEvent));
    });

    svg.node.addEventListener('mousemove', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeVertexMouseEvent(VERTEX_EVENTS.MOUSEMOVE, slide, graphic, baseEvent));
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEMOVE, slide, undefined, baseEvent));
    });
}
