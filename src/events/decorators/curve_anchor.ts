import { CurveAnchorRenderer } from '@/rendering/helpers';
import SlideRenderer from '@/rendering/SlideRenderer';
import { CURVE_ANCHOR_ROLES } from '@/rendering/types';
import SVG from 'svg.js';
import { CurveAnchorMouseEvent, CurveAnchorMouseEventPayload, CURVE_ANCHOR_EVENTS, SLIDE_EVENTS } from '../types';
import { dispatch, makeSlideMouseEvent } from '../utilities';

function makeCurveAnchorMouseEvent(name: CURVE_ANCHOR_EVENTS, slide: SlideRenderer, parentId: string, index: number, role: CURVE_ANCHOR_ROLES, baseEvent: MouseEvent): CurveAnchorMouseEvent {
    return new CustomEvent<CurveAnchorMouseEventPayload>(name, {
        detail: {
            type: name,
            slide,
            baseEvent,
            parentId,
            index,
            role
        }
    });
}

export function decorateCurveAnchorEvents(svg: SVG.Element, slide: SlideRenderer, graphic: CurveAnchorRenderer, parentId: string, index: number, role: CURVE_ANCHOR_ROLES) {
    svg.node.addEventListener('mouseup', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeCurveAnchorMouseEvent(CURVE_ANCHOR_EVENTS.MOUSEUP, slide, parentId, index, role, baseEvent));
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEUP, slide, graphic, baseEvent));
    });

    svg.node.addEventListener('mousedown', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeCurveAnchorMouseEvent(CURVE_ANCHOR_EVENTS.MOUSEDOWN, slide, parentId, index, role, baseEvent));
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEDOWN, slide, graphic, baseEvent));
    });

    svg.node.addEventListener('mouseover', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeCurveAnchorMouseEvent(CURVE_ANCHOR_EVENTS.MOUSEOVER, slide, parentId, index, role, baseEvent));
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEOVER, slide, graphic, baseEvent));
    });

    svg.node.addEventListener('mouseleave', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeCurveAnchorMouseEvent(CURVE_ANCHOR_EVENTS.MOUSEOUT, slide, parentId, index, role, baseEvent));
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEOUT, slide, graphic, baseEvent));
    });

    svg.node.addEventListener('mousemove', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeCurveAnchorMouseEvent(CURVE_ANCHOR_EVENTS.MOUSEMOVE, slide, parentId, index, role, baseEvent));
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEMOVE, slide, graphic, baseEvent));
    });
}
