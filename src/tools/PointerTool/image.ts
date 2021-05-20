import { ImageMouseEvent, IMAGE_EVENTS, SlideMouseEvent, SLIDE_EVENTS } from '@/events/types';
import { listen, listenOnce, unlisten } from '@/events';
import { ImageMutator } from '@/rendering/mutators';
import { resolvePosition } from '../utilities';

export function moveImage(event: ImageMouseEvent): void {
    const { slide, baseEvent, target } = event.detail;
    const { id: graphicId, type: graphicType } = target;
    if (!baseEvent.ctrlKey && !slide.isFocused(graphicId)) {
        slide.unfocusAllGraphics([graphicId]);
    }

    // Initialize mutator move tracking
    const mutator = slide.focusGraphic(graphicId) as ImageMutator;
    const moveListener = mutator.initMove(resolvePosition(baseEvent, slide));
    slide.lockCursor('move');
    slide.lockHighlights();

    listen(SLIDE_EVENTS.MOUSEMOVE, 'image--move', move);
    listenOnce(SLIDE_EVENTS.MOUSEUP, 'image--complete', complete);

    function move(event: SlideMouseEvent): void {
        const deltas = moveListener(event);
        slide.setProps(graphicId, graphicType, deltas);
    }

    function complete(event: SlideMouseEvent): void {
        move(event);
        mutator.endMove();
        slide.unlockCursor();
        slide.unlockHighlights();

        unlisten(SLIDE_EVENTS.MOUSEMOVE, 'image--move');
        listenOnce(IMAGE_EVENTS.MOUSEDOWN, 'image--init-move', moveImage);
    }
}

export function hoverImage(event: ImageMouseEvent): void {
    const { target, slide } = event.detail;

    if (slide.isFocused(target.id)) {
        return;
    }

    slide.highlightGraphic(target.id);

    listenOnce(IMAGE_EVENTS.MOUSEOUT, 'unhighlight', unhighlight);
    function unhighlight(): void {
        slide.unhighlightGraphic(target.id);
    }
}
