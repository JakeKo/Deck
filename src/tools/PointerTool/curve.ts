import { CurveAnchorMouseEvent, CurveMouseEvent, CURVE_ANCHOR_EVENTS, CURVE_EVENTS, SlideMouseEvent, SLIDE_EVENTS } from "../../events/types";
import { listen, listenOnce, unlisten } from "../../events/utilities";
import { CurveMutator } from "../../rendering/mutators";
import { CURVE_ANCHOR_ROLES } from "../../rendering/types";
import { resolvePosition } from "../utilities";

export function moveCurve(event: CurveMouseEvent): void {
    const { slide, baseEvent, target } = event.detail;
    if (!baseEvent.ctrlKey && !slide.isFocused(target.getId())) {
        slide.unfocusAllGraphics([target.getId()]);
    }

    const mutator = slide.focusGraphic(target.getId()) as CurveMutator;
    const originOffset = resolvePosition(baseEvent, slide).towards(mutator.getOrigin());
    const moveHandler = mutator.graphicMoveHandler();

    listen(SLIDE_EVENTS.MOUSEMOVE, move);
    listenOnce(SLIDE_EVENTS.MOUSEUP, complete);

    function move(event: SlideMouseEvent): void {
        const { slide, baseEvent } = event.detail;
        moveHandler(resolvePosition(baseEvent, slide).add(originOffset), baseEvent.shiftKey, baseEvent.altKey);
        slide.broadcastSetGraphic(mutator.getTarget());
    }

    function complete(): void {
        unlisten(SLIDE_EVENTS.MOUSEMOVE, move);
        listenOnce(CURVE_EVENTS.MOUSEDOWN, moveCurve);
    }
}

export function moveCurveAnchor(mutator: CurveMutator, role: CURVE_ANCHOR_ROLES, index: number, moveAnchor: (event: CurveAnchorMouseEvent) => void): void {
    const handler = mutator.getAnchorHandler(index, role);

    listen(SLIDE_EVENTS.MOUSEMOVE, move);
    listenOnce(SLIDE_EVENTS.MOUSEUP, complete);

    function move(event: SlideMouseEvent): void {
        const { slide, baseEvent } = event.detail;
        handler(resolvePosition(baseEvent, slide));
        slide.broadcastSetGraphic(mutator.getTarget());
    }

    function complete(): void {
        unlisten(SLIDE_EVENTS.MOUSEMOVE, move);
        listenOnce(CURVE_ANCHOR_EVENTS.MOUSEDOWN, moveAnchor);
    }
}

export function hoverCurve(event: CurveMouseEvent): void {
    const { target, slide } = event.detail;

    if (slide.isFocused(target.getId())) {
        return;
    }

    slide.markGraphic(target.getId());

    listenOnce(CURVE_EVENTS.MOUSEOUT, unmark);
    function unmark(): void {
        slide.unmarkGraphic(target.getId());
    }
}
