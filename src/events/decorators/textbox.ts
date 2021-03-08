import { ISlideRenderer, ITextboxRenderer } from '@/rendering/types';
import { dispatch } from '..';
import { SlideMouseEventPayload, SLIDE_EVENTS, TextboxMouseEventPayload, TEXTBOX_EVENTS } from '../types';

export function decorateTextboxEvents(node: SVGForeignObjectElement, slide: ISlideRenderer, target: ITextboxRenderer) {
    node.addEventListener('mouseup', baseEvent => {
        baseEvent.stopPropagation();
        dispatch<TextboxMouseEventPayload>(TEXTBOX_EVENTS.MOUSEUP, { type: TEXTBOX_EVENTS.MOUSEUP, slide, target, baseEvent });
        dispatch<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEUP, { type: SLIDE_EVENTS.MOUSEUP, slide, target, baseEvent });
    });

    node.addEventListener('mousedown', baseEvent => {
        baseEvent.stopPropagation();
        dispatch<TextboxMouseEventPayload>(TEXTBOX_EVENTS.MOUSEDOWN, { type: TEXTBOX_EVENTS.MOUSEDOWN, slide, target, baseEvent });
        dispatch<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEDOWN, { type: SLIDE_EVENTS.MOUSEDOWN, slide, target, baseEvent });
    });

    node.addEventListener('mouseover', baseEvent => {
        baseEvent.stopPropagation();
        dispatch<TextboxMouseEventPayload>(TEXTBOX_EVENTS.MOUSEOVER, { type: TEXTBOX_EVENTS.MOUSEOVER, slide, target, baseEvent });
        dispatch<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEOVER, { type: SLIDE_EVENTS.MOUSEOVER, slide, target, baseEvent });
    });

    node.addEventListener('mouseleave', ((baseEvent: MouseEvent) => {
        baseEvent.stopPropagation();
        dispatch<TextboxMouseEventPayload>(TEXTBOX_EVENTS.MOUSEOUT, { type: TEXTBOX_EVENTS.MOUSEOUT, slide, target, baseEvent });
        dispatch<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEOUT, { type: SLIDE_EVENTS.MOUSEOUT, slide, target, baseEvent });
    }) as EventListener);

    node.addEventListener('mousemove', baseEvent => {
        baseEvent.stopPropagation();
        dispatch<TextboxMouseEventPayload>(TEXTBOX_EVENTS.MOUSEMOVE, { type: TEXTBOX_EVENTS.MOUSEMOVE, slide, target, baseEvent });
        dispatch<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEMOVE, { type: SLIDE_EVENTS.MOUSEMOVE, slide, target, baseEvent });
    });
}
