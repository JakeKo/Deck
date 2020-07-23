import { RectangleMouseEvent, RECTANGLE_EVENTS, SlideMouseEvent, SLIDE_EVENTS, VertexMouseEvent, VERTEX_EVENTS } from "../../events/types";
import { listen, listenOnce, unlisten } from "../../events/utilities";
import { VertexRenderer } from "../../rendering/helpers";
import { RectangleMutator } from "../../rendering/mutators";
import { resolvePosition } from "../utilities";

export function moveRectangle(event: RectangleMouseEvent): void {
    const { slide, baseEvent, target } = event.detail;
    if (!baseEvent.ctrlKey && !slide.isFocused(target.getId())) {
        slide.unfocusAllGraphics([target.getId()]);
    }

    const originOffset = resolvePosition(baseEvent, slide).towards(target.getOrigin());
    const mutator = slide.focusGraphic(target.getId()) as RectangleMutator;

    listen(SLIDE_EVENTS.MOUSEMOVE, move);
    listenOnce(SLIDE_EVENTS.MOUSEUP, complete);

    function move(event: SlideMouseEvent): void {
        const { slide, baseEvent } = event.detail;
        mutator.move(resolvePosition(baseEvent, slide).add(originOffset));
        slide.broadcastSetGraphic(mutator.getTarget());
    }

    function complete(): void {
        unlisten(SLIDE_EVENTS.MOUSEMOVE, move);
        listenOnce(RECTANGLE_EVENTS.MOUSEDOWN, moveRectangle);
    }
}

export function moveRectangleVertex(mutator: RectangleMutator, vertex: VertexRenderer, moveVertex: (event: VertexMouseEvent) => void) {
    const handler = mutator.getVertexHandlers()[vertex.getLocation()]();

    listen(SLIDE_EVENTS.MOUSEMOVE, move);
    listenOnce(SLIDE_EVENTS.MOUSEUP, complete);

    function move(event: SlideMouseEvent): void {
        const { slide, baseEvent } = event.detail;
        handler(resolvePosition(baseEvent, slide));
        slide.broadcastSetGraphic(mutator.getTarget());
    }

    function complete(): void {
        unlisten(SLIDE_EVENTS.MOUSEMOVE, move);
        listenOnce(VERTEX_EVENTS.MOUSEDOWN, moveVertex);
    }
}
