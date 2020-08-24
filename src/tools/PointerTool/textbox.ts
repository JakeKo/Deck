import { SlideMouseEvent, SLIDE_EVENTS, TextboxMouseEvent, TEXTBOX_EVENTS } from '@/events/types';
import { listen, listenOnce, unlisten } from '@/events/utilities';
import { TextboxMutator } from '@/rendering/mutators';
import { resolvePosition } from '../utilities';

export function moveTextbox(event: TextboxMouseEvent): void {
    const { slide, baseEvent, target } = event.detail;
    if (!baseEvent.ctrlKey && !slide.isFocused(target.getId())) {
        slide.unfocusAllGraphics([target.getId()]);
    }

    const mutator = slide.focusGraphic(target.getId()) as TextboxMutator;
    const moveListener = mutator.moveListener(resolvePosition(baseEvent, slide));
    slide.cursor = 'move';
    slide.cursorLock = true;

    listen(SLIDE_EVENTS.MOUSEMOVE, move);
    listenOnce(SLIDE_EVENTS.MOUSEUP, complete);

    function move(event: SlideMouseEvent): void {
        moveListener(event);
        slide.broadcastSetGraphic(mutator.getTarget());
    }

    function complete(event: SlideMouseEvent): void {
        moveListener(event);
        slide.cursorLock = false;
        unlisten(SLIDE_EVENTS.MOUSEMOVE, move);
        listenOnce(TEXTBOX_EVENTS.MOUSEDOWN, moveTextbox);
    }
}

export function hoverTextbox(event: TextboxMouseEvent): void {
    const { target, slide } = event.detail;

    if (slide.isFocused(target.getId())) {
        return;
    }

    slide.markGraphic(target.getId());

    listenOnce(TEXTBOX_EVENTS.MOUSEOUT, unmark);
    function unmark(): void {
        slide.unmarkGraphic(target.getId());
    }
}
