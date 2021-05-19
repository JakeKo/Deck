import { ICurveRenderer, ISlideRenderer } from '@/rendering/types';
import SVG from 'svg.js';
import { dispatch } from '..';
import { CurveMouseEventPayload, CURVE_EVENTS, SlideMouseEventPayload, SLIDE_EVENTS } from '../types';

export function decorateCurveEvents(svg: SVG.Element, slide: ISlideRenderer, target: ICurveRenderer) {
    svg.node.addEventListener('mouseup', baseEvent => {
        baseEvent.stopPropagation();
        dispatch<CurveMouseEventPayload>(CURVE_EVENTS.MOUSEUP, { type: CURVE_EVENTS.MOUSEUP, slide, target, baseEvent });
        dispatch<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEUP, { type: SLIDE_EVENTS.MOUSEUP, slide, target, baseEvent });
    });

    svg.node.addEventListener('mousedown', baseEvent => {
        baseEvent.stopPropagation();
        dispatch<CurveMouseEventPayload>(CURVE_EVENTS.MOUSEDOWN, { type: CURVE_EVENTS.MOUSEDOWN, slide, target, baseEvent });
        dispatch<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEDOWN, { type: SLIDE_EVENTS.MOUSEDOWN, slide, target, baseEvent });
    });

    svg.node.addEventListener('mouseover', baseEvent => {
        baseEvent.stopPropagation();
        dispatch<CurveMouseEventPayload>(CURVE_EVENTS.MOUSEOVER, { type: CURVE_EVENTS.MOUSEOVER, slide, target, baseEvent });
        dispatch<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEOVER, { type: SLIDE_EVENTS.MOUSEOVER, slide, target, baseEvent });
    });

    svg.node.addEventListener('mouseleave', baseEvent => {
        baseEvent.stopPropagation();
        dispatch<CurveMouseEventPayload>(CURVE_EVENTS.MOUSEOUT, { type: CURVE_EVENTS.MOUSEOUT, slide, target, baseEvent });
        dispatch<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEOUT, { type: SLIDE_EVENTS.MOUSEOUT, slide, target, baseEvent });
    });

    svg.node.addEventListener('mousemove', baseEvent => {
        baseEvent.stopPropagation();
        dispatch<CurveMouseEventPayload>(CURVE_EVENTS.MOUSEMOVE, { type: CURVE_EVENTS.MOUSEMOVE, slide, target, baseEvent });
        dispatch<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEMOVE, { type: SLIDE_EVENTS.MOUSEMOVE, slide, target, baseEvent });
    });
}
