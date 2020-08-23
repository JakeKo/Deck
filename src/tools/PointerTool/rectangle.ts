import { RectangleMouseEvent, RECTANGLE_EVENTS, SlideMouseEvent, SLIDE_EVENTS } from "@/events/types";
import { listen, listenOnce, unlisten } from "@/events/utilities";
import { RectangleMutator } from "@/rendering/mutators";
import { resolvePosition } from "../utilities";

export function moveRectangle(event: RectangleMouseEvent): void {
    const { slide, baseEvent, target } = event.detail;
    if (!baseEvent.ctrlKey && !slide.isFocused(target.getId())) {
        slide.unfocusAllGraphics([target.getId()]);
    }

    const mutator = slide.focusGraphic(target.getId()) as RectangleMutator;
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
        listenOnce(RECTANGLE_EVENTS.MOUSEDOWN, moveRectangle);
    }
}

// TODO: Consider how to not mark while actively mutating graphics
export function hoverRectangle(event: RectangleMouseEvent): void {
    const { target, slide } = event.detail;

    if (slide.isFocused(target.getId())) {
        return;
    }

    slide.markGraphic(target.getId());

    listenOnce(RECTANGLE_EVENTS.MOUSEOUT, unmark);
    function unmark(): void {
        slide.unmarkGraphic(target.getId());
    }
}
