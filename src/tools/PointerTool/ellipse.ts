import { EllipseMouseEvent, ELLIPSE_EVENTS, SlideMouseEvent, SLIDE_EVENTS } from "../../events/types";
import { listen, listenOnce, unlisten } from "../../events/utilities";
import { EllipseMutator } from "../../rendering/mutators";
import { resolvePosition } from "../utilities";

export function moveEllipse(event: EllipseMouseEvent): void {
    const { slide, baseEvent, target } = event.detail;
    if (!baseEvent.ctrlKey && !slide.isFocused(target.getId())) {
        slide.unfocusAllGraphics([target.getId()]);
    }

    const centerOffset = resolvePosition(baseEvent, slide).towards(target.getCenter());
    const mutator = slide.focusGraphic(target.getId()) as EllipseMutator;

    listen(SLIDE_EVENTS.MOUSEMOVE, move);
    listenOnce(SLIDE_EVENTS.MOUSEUP, complete);

    function move(event: SlideMouseEvent): void {
        const { slide, baseEvent } = event.detail;
        mutator.move(resolvePosition(baseEvent, slide).add(centerOffset));
        slide.broadcastSetGraphic(mutator.getTarget());
    }

    function complete(): void {
        unlisten(SLIDE_EVENTS.MOUSEMOVE, move);
        listenOnce(ELLIPSE_EVENTS.MOUSEDOWN, moveEllipse);
    }
}
