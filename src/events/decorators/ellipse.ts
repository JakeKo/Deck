import * as SVG from 'svg.js';
import EllipseRenderer from '../../rendering/graphics/EllipseRenderer';
import SlideRenderer from "../../rendering/SlideRenderer";
import { EllipseMouseEvent, EllipseMouseEventPayload, ELLIPSE_EVENTS, SLIDE_EVENTS } from '../types';
import { dispatch, makeSlideMouseEvent } from '../utilities';

function makeEllipseMouseEvent(name: ELLIPSE_EVENTS, slide: SlideRenderer, target: EllipseRenderer, baseEvent: MouseEvent): EllipseMouseEvent {
    return new CustomEvent<EllipseMouseEventPayload>(name, { detail: { type: name, slide, target, baseEvent } });
}

export function decorateEllipseEvents(svg: SVG.Element, slide: SlideRenderer, graphic: EllipseRenderer) {
    svg.node.addEventListener('mouseup', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeEllipseMouseEvent(ELLIPSE_EVENTS.MOUSEUP, slide, graphic, baseEvent));
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEUP, slide, graphic, baseEvent));
    });

    svg.node.addEventListener('mousedown', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeEllipseMouseEvent(ELLIPSE_EVENTS.MOUSEDOWN, slide, graphic, baseEvent));
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEDOWN, slide, graphic, baseEvent));
    });

    svg.node.addEventListener('mouseover', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeEllipseMouseEvent(ELLIPSE_EVENTS.MOUSEOVER, slide, graphic, baseEvent));
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEOVER, slide, graphic, baseEvent));
    });

    svg.node.addEventListener('mouseleave', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeEllipseMouseEvent(ELLIPSE_EVENTS.MOUSEOUT, slide, graphic, baseEvent));
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEOUT, slide, graphic, baseEvent));
    });

    svg.node.addEventListener('mousemove', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeEllipseMouseEvent(ELLIPSE_EVENTS.MOUSEMOVE, slide, graphic, baseEvent));
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEMOVE, slide, graphic, baseEvent));
    });
}
