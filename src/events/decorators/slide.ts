import SlideRenderer from '@/rendering/SlideRenderer';
import { GraphicRenderer } from '@/rendering/types';
import { SlideKeyboardEvent, SlideKeyboardEventPayload, SLIDE_EVENTS } from '../types';
import { dispatch, makeSlideMouseEvent } from '../utilities';

function makeSlideKeyboardEvent(name: SLIDE_EVENTS, slide: SlideRenderer, target: GraphicRenderer | undefined, baseEvent: KeyboardEvent): SlideKeyboardEvent {
    return new CustomEvent<SlideKeyboardEventPayload>(name, { detail: { type: name, slide, target, baseEvent } });
}

export function decorateSlideEvents(slideRenderer: SlideRenderer): void {
    slideRenderer.canvas.node.addEventListener('mouseup', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEUP, slideRenderer, undefined, baseEvent));
    });

    slideRenderer.canvas.node.addEventListener('mousedown', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEDOWN, slideRenderer, undefined, baseEvent));
    });

    slideRenderer.canvas.node.addEventListener('mouseover', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEOVER, slideRenderer, undefined, baseEvent));
    });

    slideRenderer.canvas.node.addEventListener('mouseleave', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEOUT, slideRenderer, undefined, baseEvent));
    });

    slideRenderer.canvas.node.addEventListener('mousemove', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEMOVE, slideRenderer, undefined, baseEvent));
    });

    slideRenderer.canvas.node.addEventListener('keyup', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeSlideKeyboardEvent(SLIDE_EVENTS.KEYUP, slideRenderer, undefined, baseEvent));
    });

    slideRenderer.canvas.node.addEventListener('keydown', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeSlideKeyboardEvent(SLIDE_EVENTS.KEYDOWN, slideRenderer, undefined, baseEvent));
    });
}
