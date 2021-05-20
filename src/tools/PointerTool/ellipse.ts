import { EllipseMouseEvent, ELLIPSE_EVENTS, SlideMouseEvent, SLIDE_EVENTS } from '@/events/types';
import { listen, listenOnce, unlisten } from '@/events';
import { EllipseMutator } from '@/rendering/mutators';
import { resolvePosition } from '../utilities';

export function moveEllipse(event: EllipseMouseEvent): void {
    const { slide, baseEvent, target } = event.detail;
    const { id: graphicId, type: graphicType } = target;
    if (!baseEvent.ctrlKey && !slide.isFocused(graphicId)) {
        slide.unfocusAllGraphics([graphicId]);
    }

    // Initialize mutator move tracking
    const mutator = slide.focusGraphic(graphicId) as EllipseMutator;
    const moveListener = mutator.initMove(resolvePosition(baseEvent, slide));
    slide.lockCursor('move');
    slide.lockHighlights();

    listen(SLIDE_EVENTS.MOUSEMOVE, 'ellipse--move', move);
    listenOnce(SLIDE_EVENTS.MOUSEUP, 'ellipse--complete', complete);

    function move(event: SlideMouseEvent): void {
        const deltas = moveListener(event);
        slide.setProps(graphicId, graphicType, deltas);
    }

    function complete(event: SlideMouseEvent): void {
        move(event);
        mutator.endMove();
        slide.unlockCursor();
        slide.unlockHighlights();

        unlisten(SLIDE_EVENTS.MOUSEMOVE, 'ellipse--move');
        listenOnce(ELLIPSE_EVENTS.MOUSEDOWN, 'ellipse--init-move', moveEllipse);
    }
}

export function hoverEllipse(event: EllipseMouseEvent): void {
    const { target, slide } = event.detail;

    if (slide.isFocused(target.id)) {
        return;
    }

    slide.highlightGraphic(target.id);

    listenOnce(ELLIPSE_EVENTS.MOUSEOUT, 'unhighlight', unhighlight);
    function unhighlight(): void {
        slide.unhighlightGraphic(target.id);
    }
}
