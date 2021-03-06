import { CURVE_ANCHOR_ROLES, ICurveAnchorRenderer, ISlideRenderer } from '@/rendering/types';
import SVG from 'svg.js';
import { dispatch } from '..';
import { CurveAnchorMouseEventPayload, CURVE_ANCHOR_EVENTS, SlideMouseEventPayload, SLIDE_EVENTS } from '../types';

export function decorateCurveAnchorEvents(svg: SVG.Element, slide: ISlideRenderer, target: ICurveAnchorRenderer, parentId: string, index: number, role: CURVE_ANCHOR_ROLES) {
    svg.node.addEventListener('mouseup', baseEvent => {
        baseEvent.stopPropagation();
        dispatch<CurveAnchorMouseEventPayload>(CURVE_ANCHOR_EVENTS.MOUSEUP, { type: CURVE_ANCHOR_EVENTS.MOUSEUP, slide, baseEvent, parentId, index, role });
        dispatch<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEUP, { type: SLIDE_EVENTS.MOUSEUP, slide, target, baseEvent });
    });

    svg.node.addEventListener('mousedown', baseEvent => {
        baseEvent.stopPropagation();
        dispatch<CurveAnchorMouseEventPayload>(CURVE_ANCHOR_EVENTS.MOUSEDOWN, { type: CURVE_ANCHOR_EVENTS.MOUSEDOWN, slide, baseEvent, parentId, index, role });
        dispatch<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEDOWN, { type: SLIDE_EVENTS.MOUSEDOWN, slide, target, baseEvent });
    });

    svg.node.addEventListener('mouseover', baseEvent => {
        baseEvent.stopPropagation();
        dispatch<CurveAnchorMouseEventPayload>(CURVE_ANCHOR_EVENTS.MOUSEOVER, { type: CURVE_ANCHOR_EVENTS.MOUSEOVER, slide, baseEvent, parentId, index, role });
        dispatch<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEOVER, { type: SLIDE_EVENTS.MOUSEOVER, slide, target, baseEvent });
    });

    svg.node.addEventListener('mouseleave', baseEvent => {
        baseEvent.stopPropagation();
        dispatch<CurveAnchorMouseEventPayload>(CURVE_ANCHOR_EVENTS.MOUSEOUT, { type: CURVE_ANCHOR_EVENTS.MOUSEOUT, slide, baseEvent, parentId, index, role });
        dispatch<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEOUT, { type: SLIDE_EVENTS.MOUSEOUT, slide, target, baseEvent });
    });

    svg.node.addEventListener('mousemove', baseEvent => {
        baseEvent.stopPropagation();
        dispatch<CurveAnchorMouseEventPayload>(CURVE_ANCHOR_EVENTS.MOUSEMOVE, { type: CURVE_ANCHOR_EVENTS.MOUSEMOVE, slide, baseEvent, parentId, index, role });
        dispatch<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEMOVE, { type: SLIDE_EVENTS.MOUSEMOVE, slide, target, baseEvent });
    });
}
