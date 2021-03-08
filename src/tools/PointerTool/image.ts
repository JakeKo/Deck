import { ImageMouseEvent, IMAGE_EVENTS, SlideMouseEvent, SLIDE_EVENTS } from '@/events/types';
import { listen, listenOnce, unlisten } from '@/events';
import { ImageMutator } from '@/rendering/mutators';
import { resolvePosition } from '../utilities';

export function moveImage(event: ImageMouseEvent): void {
    const { slide, baseEvent, target } = event.detail;
    if (!baseEvent.ctrlKey && !slide.isFocused(target.id)) {
        slide.unfocusAllGraphics([target.id]);
    }

    const mutator = slide.focusGraphic(target.id) as ImageMutator;
    const moveListener = mutator.moveListener(resolvePosition(baseEvent, slide), slide.getSnapVectors([target.id]));
    slide.cursor = 'move';
    slide.cursorLock = true;

    listen(SLIDE_EVENTS.MOUSEMOVE, 'move', move);
    listenOnce(SLIDE_EVENTS.MOUSEUP, 'complete', complete);

    function move(event: SlideMouseEvent): void {
        moveListener(event);
        slide.broadcastSetGraphic(mutator.target);
    }

    function complete(event: SlideMouseEvent): void {
        moveListener(event);
        slide.broadcastSetGraphic(mutator.target);
        slide.cursorLock = false;
        slide.unrenderAllSnapVectors();
        unlisten(SLIDE_EVENTS.MOUSEMOVE, 'move');
        listenOnce(IMAGE_EVENTS.MOUSEDOWN, 'moveImage', moveImage);
    }
}

export function hoverImage(event: ImageMouseEvent): void {
    const { target, slide } = event.detail;

    if (slide.isFocused(target.id)) {
        return;
    }

    slide.markGraphic(target.id);

    listenOnce(IMAGE_EVENTS.MOUSEOUT, 'unmark', unmark);
    function unmark(): void {
        slide.unmarkGraphic(target.id);
    }
}
