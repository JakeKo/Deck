import { IGraphicRenderer, ISlideRenderer } from '@/rendering/types';
import { SlideKeyboardEvent, SlideKeyboardEventPayload, SLIDE_EVENTS } from '../types';
import { dispatch, makeSlideMouseEvent } from '../utilities';

function makeSlideKeyboardEvent(name: SLIDE_EVENTS, slide: ISlideRenderer, target: IGraphicRenderer | undefined, baseEvent: KeyboardEvent): SlideKeyboardEvent {
    return new CustomEvent<SlideKeyboardEventPayload>(name, { detail: { type: name, slide, target, baseEvent } });
}

export function decorateSlideEvents(slide: ISlideRenderer): void {
    slide.canvas.node.addEventListener('mouseup', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEUP, slide, undefined, baseEvent));
    });

    slide.canvas.node.addEventListener('mousedown', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEDOWN, slide, undefined, baseEvent));
    });

    slide.canvas.node.addEventListener('mouseover', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEOVER, slide, undefined, baseEvent));
    });

    slide.canvas.node.addEventListener('mouseleave', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEOUT, slide, undefined, baseEvent));
    });

    slide.canvas.node.addEventListener('mousemove', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEMOVE, slide, undefined, baseEvent));
    });

    slide.canvas.node.addEventListener('keyup', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeSlideKeyboardEvent(SLIDE_EVENTS.KEYUP, slide, undefined, baseEvent));
    });

    slide.canvas.node.addEventListener('keydown', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeSlideKeyboardEvent(SLIDE_EVENTS.KEYDOWN, slide, undefined, baseEvent));
    });
}
