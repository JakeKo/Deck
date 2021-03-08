import { SlideMouseEvent, SLIDE_EVENTS, VideoMouseEvent, VIDEO_EVENTS } from '@/events/types';
import { listen, listenOnce, unlisten } from '@/events';
import { VideoMutator } from '@/rendering/mutators';
import { resolvePosition } from '../utilities';

export function moveVideo(event: VideoMouseEvent): void {
    const { slide, baseEvent, target } = event.detail;
    if (!baseEvent.ctrlKey && !slide.isFocused(target.id)) {
        slide.unfocusAllGraphics([target.id]);
    }

    const mutator = slide.focusGraphic(target.id) as VideoMutator;
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
        listenOnce(VIDEO_EVENTS.MOUSEDOWN, 'moveVideo', moveVideo);
    }
}

export function hoverVideo(event: VideoMouseEvent): void {
    const { target, slide } = event.detail;

    if (slide.isFocused(target.id)) {
        return;
    }

    slide.markGraphic(target.id);

    listenOnce(VIDEO_EVENTS.MOUSEOUT, 'unmark', unmark);
    function unmark(): void {
        slide.unmarkGraphic(target.id);
    }
}
