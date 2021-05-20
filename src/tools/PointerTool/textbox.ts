import { SlideMouseEvent, SLIDE_EVENTS, TextboxMouseEvent, TEXTBOX_EVENTS } from '@/events/types';
import { listen, listenOnce, unlisten } from '@/events';
import { TextboxMutator } from '@/rendering/mutators';
import { resolvePosition } from '../utilities';

export function moveTextbox(event: TextboxMouseEvent): void {
    const { slide, baseEvent, target } = event.detail;
    const { id: graphicId, type: graphicType } = target;
    if (!baseEvent.ctrlKey && !slide.isFocused(graphicId)) {
        slide.unfocusAllGraphics([graphicId]);
    }

    // Initialize mutator move tracking
    const mutator = slide.focusGraphic(graphicId) as TextboxMutator;
    const moveListener = mutator.initMove(resolvePosition(baseEvent, slide));
    slide.lockCursor('move');
    slide.lockHighlights();

    listen(SLIDE_EVENTS.MOUSEMOVE, 'textbox--move', move);
    listenOnce(SLIDE_EVENTS.MOUSEUP, 'textbox--complete', complete);

    function move(event: SlideMouseEvent): void {
        const deltas = moveListener(event);
        slide.setProps(graphicId, graphicType, deltas);
    }

    function complete(event: SlideMouseEvent): void {
        move(event);
        mutator.endMove();
        slide.unlockCursor();
        slide.unlockHighlights();

        unlisten(SLIDE_EVENTS.MOUSEMOVE, 'textbox--move');
        listenOnce(TEXTBOX_EVENTS.MOUSEDOWN, 'textbox--init-move', moveTextbox);
    }
}

export function hoverTextbox(event: TextboxMouseEvent): void {
    const { target, slide } = event.detail;

    if (slide.isFocused(target.id)) {
        return;
    }

    slide.highlightGraphic(target.id);

    listenOnce(TEXTBOX_EVENTS.MOUSEOUT, 'unhighlight', unhighlight);
    function unhighlight(): void {
        slide.unhighlightGraphic(target.id);
    }
}
