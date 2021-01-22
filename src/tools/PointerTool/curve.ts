import { CurveAnchorMouseEvent, CurveMouseEvent, CURVE_ANCHOR_EVENTS, CURVE_EVENTS, SlideMouseEvent, SLIDE_EVENTS } from '@/events/types';
import { listen, listenOnce, unlisten } from '@/events/utilities';
import { CurveMutator } from '@/rendering/mutators';
import { resolvePosition } from '../utilities';

export function moveCurve(event: CurveMouseEvent): void {
    const { slide, baseEvent, target } = event.detail;
    if (!baseEvent.ctrlKey && !slide.isFocused(target.id)) {
        slide.unfocusAllGraphics([target.id]);
    }

    const mutator = slide.focusGraphic(target.id) as CurveMutator;
    const moveListener = mutator.moveListener(resolvePosition(baseEvent, slide), slide.getSnapVectors([target.id]));
    slide.cursor = 'move';
    slide.cursorLock = true;

    listen(SLIDE_EVENTS.MOUSEMOVE, move);
    listenOnce(SLIDE_EVENTS.MOUSEUP, complete);

    function move(event: SlideMouseEvent): void {
        moveListener(event);
        slide.broadcastSetGraphic(mutator.target);
    }

    function complete(event: SlideMouseEvent): void {
        moveListener(event);
        slide.cursorLock = false;
        unlisten(SLIDE_EVENTS.MOUSEMOVE, move);
        listenOnce(CURVE_EVENTS.MOUSEDOWN, moveCurve);
    }
}

export function moveCurveAnchor(event: CurveAnchorMouseEvent, moveAnchor: (event: CurveAnchorMouseEvent) => void): void {
    const { slide, parentId, index, role } = event.detail;
    const mutator = slide.focusGraphic(parentId) as CurveMutator;

    // Handler must be instantiated at the beginning of the mutation to capture initial state
    // Handler cannot be instantiated immediately during each move event
    const anchorListener = mutator.anchorListener(index, role);
    slide.cursor = 'grabbing';
    slide.cursorLock = true;

    listen(SLIDE_EVENTS.MOUSEMOVE, move);
    listenOnce(SLIDE_EVENTS.MOUSEUP, complete);

    function move(event: SlideMouseEvent): void {
        anchorListener(event);
        slide.broadcastSetGraphic(mutator.target);
    }

    function complete(): void {
        slide.cursorLock = false;
        slide.cursor = 'grab';

        unlisten(SLIDE_EVENTS.MOUSEMOVE, move);
        listenOnce(CURVE_ANCHOR_EVENTS.MOUSEDOWN, moveAnchor);
    }
}

export function hoverCurve(event: CurveMouseEvent): void {
    const { target, slide } = event.detail;

    if (slide.isFocused(target.id)) {
        return;
    }

    slide.markGraphic(target.id);

    listenOnce(CURVE_EVENTS.MOUSEOUT, unmark);
    function unmark(): void {
        slide.unmarkGraphic(target.id);
    }
}
