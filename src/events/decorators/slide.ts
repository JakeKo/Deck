import { ISlideRenderer } from '@/rendering/types';
import { dispatch } from '..';
import { SlideKeyboardEventPayload, SlideMouseEventPayload, SLIDE_EVENTS } from '../types';

export function decorateSlideEvents(slide: ISlideRenderer): void {
    slide.canvas.node.addEventListener('mouseup', baseEvent => {
        baseEvent.stopPropagation();
        dispatch<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEUP, { type: SLIDE_EVENTS.MOUSEUP, slide, target: undefined, baseEvent });
    });

    slide.canvas.node.addEventListener('mousedown', baseEvent => {
        baseEvent.stopPropagation();
        dispatch<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEDOWN, { type: SLIDE_EVENTS.MOUSEDOWN, slide, target: undefined, baseEvent });
    });

    slide.canvas.node.addEventListener('mouseover', baseEvent => {
        baseEvent.stopPropagation();
        dispatch<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEOVER, { type: SLIDE_EVENTS.MOUSEOVER, slide, target: undefined, baseEvent });
    });

    slide.canvas.node.addEventListener('mouseleave', baseEvent => {
        baseEvent.stopPropagation();
        dispatch<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEOUT, { type: SLIDE_EVENTS.MOUSEOUT, slide, target: undefined, baseEvent });
    });

    slide.canvas.node.addEventListener('mousemove', baseEvent => {
        baseEvent.stopPropagation();
        dispatch<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEMOVE, { type: SLIDE_EVENTS.MOUSEMOVE, slide, target: undefined, baseEvent });
    });

    slide.canvas.node.addEventListener('keyup', baseEvent => {
        baseEvent.stopPropagation();
        dispatch<SlideKeyboardEventPayload>(SLIDE_EVENTS.KEYUP, { type: SLIDE_EVENTS.KEYUP, slide, target: undefined, baseEvent });
    });

    slide.canvas.node.addEventListener('keydown', baseEvent => {
        baseEvent.stopPropagation();
        dispatch<SlideKeyboardEventPayload>(SLIDE_EVENTS.KEYDOWN, { type: SLIDE_EVENTS.KEYDOWN, slide, target: undefined, baseEvent });
    });
}
