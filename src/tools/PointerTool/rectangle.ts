import { RectangleMouseEvent, RECTANGLE_EVENTS, SlideMouseEvent, SLIDE_EVENTS } from '@/events/types';
import { listen, listenOnce, unlisten } from '@/events';
import { RectangleMutator } from '@/rendering/mutators';
import { resolvePosition } from '../utilities';

export function moveRectangle(event: RectangleMouseEvent): void {
    const { slide, baseEvent, target } = event.detail;
    const { id: graphicId, type: graphicType } = target;
    if (!baseEvent.ctrlKey && !slide.isFocused(graphicId)) {
        slide.unfocusAllGraphics([graphicId]);
    }

    // Initialize mutator move tracking
    const mutator = slide.focusGraphic(graphicId) as RectangleMutator;
    const moveListener = mutator.initMove(resolvePosition(baseEvent, slide));
    slide.lockCursor('move');

    listen(SLIDE_EVENTS.MOUSEMOVE, 'rectangle--move', move);
    listenOnce(SLIDE_EVENTS.MOUSEUP, 'rectangle--complete', complete);

    function move(event: SlideMouseEvent): void {
        const deltas = moveListener(event);
        slide.setProps(graphicId, graphicType, deltas);
    }

    function complete(event: SlideMouseEvent): void {
        move(event);
        mutator.endMove();
        slide.unlockCursor();

        unlisten(SLIDE_EVENTS.MOUSEMOVE, 'rectangle--move');
        listenOnce(RECTANGLE_EVENTS.MOUSEDOWN, 'rectangle--init-move', moveRectangle);
    }
}

// TODO: Consider how to not mark while actively mutating graphics
export function hoverRectangle(event: RectangleMouseEvent): void {
    const { target, slide } = event.detail;

    if (slide.isFocused(target.id)) {
        return;
    }

    slide.markGraphic(target.id);

    listenOnce(RECTANGLE_EVENTS.MOUSEOUT, 'unmark', unmark);
    function unmark(): void {
        slide.unmarkGraphic(target.id);
    }
}
