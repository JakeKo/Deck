import * as SVG from 'svg.js';
import RotatorRenderer from '../../rendering/helpers/RotatorRenderer';
import SlideRenderer from "../../rendering/SlideRenderer";
import { RotatorMouseEvent, RotatorMouseEventPayload, ROTATOR_EVENTS, SLIDE_EVENTS } from "../types";
import { dispatch, makeSlideMouseEvent } from "../utilities";

function makeRotatorMouseEvent(name: ROTATOR_EVENTS, slide: SlideRenderer, parentId: string, baseEvent: MouseEvent): RotatorMouseEvent {
    return new CustomEvent<RotatorMouseEventPayload>(name, { detail: { type: name, slide, parentId, baseEvent } });
}

export function decorateRotateEvents(svg: SVG.Element, slide: SlideRenderer, graphic: RotatorRenderer): void {
    svg.node.addEventListener('mouseup', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeRotatorMouseEvent(ROTATOR_EVENTS.MOUSEUP, slide, graphic.getParent().getId(), baseEvent));
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEUP, slide, graphic, baseEvent));
    });

    svg.node.addEventListener('mousedown', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeRotatorMouseEvent(ROTATOR_EVENTS.MOUSEDOWN, slide, graphic.getParent().getId(), baseEvent));
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEDOWN, slide, graphic, baseEvent));
    });

    svg.node.addEventListener('mouseover', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeRotatorMouseEvent(ROTATOR_EVENTS.MOUSEOVER, slide, graphic.getParent().getId(), baseEvent));
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEOVER, slide, graphic, baseEvent));
    });

    svg.node.addEventListener('mouseleave', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeRotatorMouseEvent(ROTATOR_EVENTS.MOUSEOUT, slide, graphic.getParent().getId(), baseEvent));
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEOUT, slide, graphic, baseEvent));
    });

    svg.node.addEventListener('mousemove', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeRotatorMouseEvent(ROTATOR_EVENTS.MOUSEMOVE, slide, graphic.getParent().getId(), baseEvent));
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEMOVE, slide, graphic, baseEvent));
    });
}
