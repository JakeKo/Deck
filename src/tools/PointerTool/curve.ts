import { CurveMouseEvent, CURVE_EVENTS, SlideMouseEvent, SLIDE_EVENTS } from "../../events/types";
import { listen, listenOnce, unlisten } from "../../events/utilities";
import { CurveMutator } from "../../rendering/mutators";
import { resolvePosition } from "../utilities";

export function moveCurve(event: CurveMouseEvent): void {
    const { slide, baseEvent, target } = event.detail;
    if (!baseEvent.ctrlKey && !slide.isFocused(target.getId())) {
        slide.unfocusAllGraphics([target.getId()]);
    }

    const mutator = slide.focusGraphic(target.getId()) as CurveMutator;
    const originOffset = resolvePosition(baseEvent, slide).towards(mutator.getOrigin());

    listen(SLIDE_EVENTS.MOUSEMOVE, move);
    listenOnce(SLIDE_EVENTS.MOUSEUP, complete);

    function move(event: SlideMouseEvent): void {
        const { slide, baseEvent } = event.detail;
        mutator.move(resolvePosition(baseEvent, slide).add(originOffset));
        slide.broadcastSetGraphic(mutator.getTarget());
    }

    function complete(): void {
        unlisten(SLIDE_EVENTS.MOUSEMOVE, move);
        listenOnce(CURVE_EVENTS.MOUSEDOWN, moveCurve);
    }
}
