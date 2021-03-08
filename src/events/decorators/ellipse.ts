import { IEllipseRenderer, ISlideRenderer } from '@/rendering/types';
import SVG from 'svg.js';
import { dispatch } from '..';
import { EllipseMouseEventPayload, ELLIPSE_EVENTS, SlideMouseEventPayload, SLIDE_EVENTS } from '../types';

export function decorateEllipseEvents(svg: SVG.Element, slide: ISlideRenderer, target: IEllipseRenderer) {
    svg.node.addEventListener('mouseup', baseEvent => {
        baseEvent.stopPropagation();
        dispatch<EllipseMouseEventPayload>(ELLIPSE_EVENTS.MOUSEUP, { type: ELLIPSE_EVENTS.MOUSEUP, slide, target, baseEvent });
        dispatch<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEUP, { type: SLIDE_EVENTS.MOUSEUP, slide, target, baseEvent });
    });

    svg.node.addEventListener('mousedown', baseEvent => {
        baseEvent.stopPropagation();
        dispatch<EllipseMouseEventPayload>(ELLIPSE_EVENTS.MOUSEDOWN, { type: ELLIPSE_EVENTS.MOUSEDOWN, slide, target, baseEvent });
        dispatch<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEDOWN, { type: SLIDE_EVENTS.MOUSEDOWN, slide, target, baseEvent });
    });

    svg.node.addEventListener('mouseover', baseEvent => {
        baseEvent.stopPropagation();
        dispatch<EllipseMouseEventPayload>(ELLIPSE_EVENTS.MOUSEOVER, { type: ELLIPSE_EVENTS.MOUSEOVER, slide, target, baseEvent });
        dispatch<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEOVER, { type: SLIDE_EVENTS.MOUSEOVER, slide, target, baseEvent });
    });

    svg.node.addEventListener('mouseleave', baseEvent => {
        baseEvent.stopPropagation();
        dispatch<EllipseMouseEventPayload>(ELLIPSE_EVENTS.MOUSEOUT, { type: ELLIPSE_EVENTS.MOUSEOUT, slide, target, baseEvent });
        dispatch<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEOUT, { type: SLIDE_EVENTS.MOUSEOUT, slide, target, baseEvent });
    });

    svg.node.addEventListener('mousemove', baseEvent => {
        baseEvent.stopPropagation();
        dispatch<EllipseMouseEventPayload>(ELLIPSE_EVENTS.MOUSEMOVE, { type: ELLIPSE_EVENTS.MOUSEMOVE, slide, target, baseEvent });
        dispatch<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEMOVE, { type: SLIDE_EVENTS.MOUSEMOVE, slide, target, baseEvent });
    });
}
