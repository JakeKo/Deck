import { ISlideRenderer, ITextboxRenderer } from '@/rendering/types';
import { SLIDE_EVENTS, TextboxMouseEvent, TextboxMouseEventPayload, TEXTBOX_EVENTS } from '../types';
import { dispatch, makeSlideMouseEvent } from '../utilities';

function makeTextboxMouseEvent(name: TEXTBOX_EVENTS, slide: ISlideRenderer, target: ITextboxRenderer, baseEvent: MouseEvent): TextboxMouseEvent {
    return new CustomEvent<TextboxMouseEventPayload>(name, { detail: { type: name, slide, target, baseEvent } });
}

export function decorateTextboxEvents(node: SVGForeignObjectElement, slide: ISlideRenderer, graphic: ITextboxRenderer) {
    node.addEventListener('mouseup', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeTextboxMouseEvent(TEXTBOX_EVENTS.MOUSEUP, slide, graphic, baseEvent));
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEUP, slide, graphic, baseEvent));
    });

    node.addEventListener('mousedown', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeTextboxMouseEvent(TEXTBOX_EVENTS.MOUSEDOWN, slide, graphic, baseEvent));
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEDOWN, slide, graphic, baseEvent));
    });

    node.addEventListener('mouseover', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeTextboxMouseEvent(TEXTBOX_EVENTS.MOUSEOVER, slide, graphic, baseEvent));
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEOVER, slide, graphic, baseEvent));
    });

    node.addEventListener('mouseleave', ((baseEvent: MouseEvent) => {
        baseEvent.stopPropagation();
        dispatch(makeTextboxMouseEvent(TEXTBOX_EVENTS.MOUSEOUT, slide, graphic, baseEvent));
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEOUT, slide, graphic, baseEvent));
    }) as EventListener);

    node.addEventListener('mousemove', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeTextboxMouseEvent(TEXTBOX_EVENTS.MOUSEMOVE, slide, graphic, baseEvent));
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEMOVE, slide, graphic, baseEvent));
    });
}
