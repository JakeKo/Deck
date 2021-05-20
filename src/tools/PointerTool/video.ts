import { SlideMouseEvent, SLIDE_EVENTS, VideoMouseEvent, VIDEO_EVENTS } from '@/events/types';
import { listen, listenOnce, unlisten } from '@/events';
import { VideoMutator } from '@/rendering/mutators';
import { resolvePosition } from '../utilities';

export function moveVideo(event: VideoMouseEvent): void {
    const { slide, baseEvent, target } = event.detail;
    const { id: graphicId, type: graphicType } = target;
    if (!baseEvent.ctrlKey && !slide.isFocused(graphicId)) {
        slide.unfocusAllGraphics([graphicId]);
    }

    // Initialize mutator move tracking
    const mutator = slide.focusGraphic(graphicId) as VideoMutator;
    const moveListener = mutator.initMove(resolvePosition(baseEvent, slide));
    slide.lockCursor('move');
    slide.lockHighlights();

    listen(SLIDE_EVENTS.MOUSEMOVE, 'video--move', move);
    listenOnce(SLIDE_EVENTS.MOUSEUP, 'video--complete', complete);

    function move(event: SlideMouseEvent): void {
        const deltas = moveListener(event);
        slide.setProps(graphicId, graphicType, deltas);
    }

    function complete(event: SlideMouseEvent): void {
        move(event);
        mutator.endMove();
        slide.unlockCursor();
        slide.unlockHighlights();

        unlisten(SLIDE_EVENTS.MOUSEMOVE, 'video--move');
        listenOnce(VIDEO_EVENTS.MOUSEDOWN, 'video--init-move', moveVideo);
    }
}

export function hoverVideo(event: VideoMouseEvent): void {
    const { target, slide } = event.detail;

    if (slide.isFocused(target.id)) {
        return;
    }

    slide.highlightGraphic(target.id);

    listenOnce(VIDEO_EVENTS.MOUSEOUT, 'unhighlight', unhighlight);
    function unhighlight(): void {
        slide.unhighlightGraphic(target.id);
    }
}
