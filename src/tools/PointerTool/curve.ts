import { CurveAnchorMouseEvent, CurveMouseEvent, CURVE_ANCHOR_EVENTS, CURVE_EVENTS, SlideMouseEvent, SLIDE_EVENTS } from '@/events/types';
import { listen, listenOnce, unlisten } from '@/events';
import { CurveMutator } from '@/rendering/mutators';
import { resolvePosition } from '../utilities';

export function moveCurve(event: CurveMouseEvent): void {
    const { slide, baseEvent, target } = event.detail;
    const { id: graphicId, type: graphicType } = target;
    if (!baseEvent.ctrlKey && !slide.isFocused(graphicId)) {
        slide.unfocusAllGraphics([graphicId]);
    }

    // Initialize mutator move tracking
    const mutator = slide.focusGraphic(graphicId) as CurveMutator;
    const moveListener = mutator.initMove(resolvePosition(baseEvent, slide));
    slide.lockCursor('move');

    listen(SLIDE_EVENTS.MOUSEMOVE, 'curve--move', move);
    listenOnce(SLIDE_EVENTS.MOUSEUP, 'curve--complete', complete);

    function move(event: SlideMouseEvent): void {
        const deltas = moveListener(event);
        slide.setProps(graphicId, graphicType, deltas);
    }

    function complete(event: SlideMouseEvent): void {
        move(event);
        mutator.endMove();
        slide.unlockCursor();

        unlisten(SLIDE_EVENTS.MOUSEMOVE, 'curve--move');
        listenOnce(CURVE_EVENTS.MOUSEDOWN, 'curve--init-move', moveCurve);
    }
}

export function moveCurveAnchor(event: CurveAnchorMouseEvent): void {
    const { slide, parentId, index, role } = event.detail;
    const { id: graphicId, type: graphicType } = slide.getGraphic(parentId);
    const mutator = slide.focusGraphic(graphicId) as CurveMutator;

    // Handler must be instantiated at the beginning of the mutation to capture initial state
    // Handler cannot be instantiated immediately during each move event
    const anchorListener = mutator.initAnchorMove(index, role);
    slide.lockCursor('grabbing');

    listen(SLIDE_EVENTS.MOUSEMOVE, 'curve-anchor--move', move);
    listenOnce(SLIDE_EVENTS.MOUSEUP, 'curve-anchor--complete', complete);

    function move(event: SlideMouseEvent): void {
        const deltas = anchorListener(event);
        slide.setProps(graphicId, graphicType, deltas);
    }

    function complete(event: SlideMouseEvent): void {
        move(event);
        mutator.endAnchorMove();
        slide.unlockCursor('grab');

        unlisten(SLIDE_EVENTS.MOUSEMOVE, 'curve-anchor--move');
        listenOnce(CURVE_ANCHOR_EVENTS.MOUSEDOWN, 'curve-anchor--init-move', moveCurveAnchor);
    }
}

export function hoverCurve(event: CurveMouseEvent): void {
    const { target, slide } = event.detail;

    if (slide.isFocused(target.id)) {
        return;
    }

    slide.markGraphic(target.id);

    listenOnce(CURVE_EVENTS.MOUSEOUT, 'unmark', unmark);
    function unmark(): void {
        slide.unmarkGraphic(target.id);
    }
}
