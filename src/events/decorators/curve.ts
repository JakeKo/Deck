import { ICurveRenderer, ISlideRenderer } from '@/rendering/types';
import SVG from 'svg.js';
import { CurveMouseEvent, CurveMouseEventPayload, CURVE_EVENTS, SLIDE_EVENTS } from '../types';
import { dispatch, makeSlideMouseEvent } from '../utilities';

function makeCurveMouseEvent(name: CURVE_EVENTS, slide: ISlideRenderer, target: ICurveRenderer, baseEvent: MouseEvent): CurveMouseEvent {
    return new CustomEvent<CurveMouseEventPayload>(name, { detail: { type: name, slide, target, baseEvent } });
}

export function decorateCurveEvents(svg: SVG.Element, slide: ISlideRenderer, graphic: ICurveRenderer) {
    svg.node.addEventListener('mouseup', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeCurveMouseEvent(CURVE_EVENTS.MOUSEUP, slide, graphic, baseEvent));
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEUP, slide, graphic, baseEvent));
    });

    svg.node.addEventListener('mousedown', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeCurveMouseEvent(CURVE_EVENTS.MOUSEDOWN, slide, graphic, baseEvent));
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEDOWN, slide, graphic, baseEvent));
    });

    svg.node.addEventListener('mouseover', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeCurveMouseEvent(CURVE_EVENTS.MOUSEOVER, slide, graphic, baseEvent));
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEOVER, slide, graphic, baseEvent));
    });

    svg.node.addEventListener('mouseleave', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeCurveMouseEvent(CURVE_EVENTS.MOUSEOUT, slide, graphic, baseEvent));
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEOUT, slide, graphic, baseEvent));
    });

    svg.node.addEventListener('mousemove', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeCurveMouseEvent(CURVE_EVENTS.MOUSEMOVE, slide, graphic, baseEvent));
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEMOVE, slide, graphic, baseEvent));
    });
}
