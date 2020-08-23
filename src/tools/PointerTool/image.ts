import { ImageMouseEvent, IMAGE_EVENTS, SlideMouseEvent, SLIDE_EVENTS } from "@/events/types";
import { listen, listenOnce, unlisten } from "@/events/utilities";
import { ImageMutator } from "@/rendering/mutators";
import { resolvePosition } from "../utilities";

export function moveImage(event: ImageMouseEvent): void {
    const { slide, baseEvent, target } = event.detail;
    if (!baseEvent.ctrlKey && !slide.isFocused(target.getId())) {
        slide.unfocusAllGraphics([target.getId()]);
    }

    const mutator = slide.focusGraphic(target.getId()) as ImageMutator;
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
        listenOnce(IMAGE_EVENTS.MOUSEDOWN, moveImage);
    }
}

export function hoverImage(event: ImageMouseEvent): void {
    const { target, slide } = event.detail;

    if (slide.isFocused(target.getId())) {
        return;
    }

    slide.markGraphic(target.getId());

    listenOnce(IMAGE_EVENTS.MOUSEOUT, unmark);
    function unmark(): void {
        slide.unmarkGraphic(target.getId());
    }
}
