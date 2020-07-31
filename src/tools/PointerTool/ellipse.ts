import { EllipseMouseEvent, ELLIPSE_EVENTS, SlideMouseEvent, SLIDE_EVENTS, VertexMouseEvent, VERTEX_EVENTS } from "../../events/types";
import { listen, listenOnce, unlisten } from "../../events/utilities";
import { VertexRenderer } from "../../rendering/helpers";
import { EllipseMutator } from "../../rendering/mutators";
import { resolvePosition } from "../utilities";

export function moveEllipse(event: EllipseMouseEvent): void {
    const { slide, baseEvent, target } = event.detail;
    if (!baseEvent.ctrlKey && !slide.isFocused(target.getId())) {
        slide.unfocusAllGraphics([target.getId()]);
    }

    const centerOffset = resolvePosition(baseEvent, slide).towards(target.getCenter());
    const mutator = slide.focusGraphic(target.getId()) as EllipseMutator;
    const moveHandler = mutator.graphicMoveHandler();

    listen(SLIDE_EVENTS.MOUSEMOVE, move);
    listenOnce(SLIDE_EVENTS.MOUSEUP, complete);

    function move(event: SlideMouseEvent): void {
        const { slide, baseEvent } = event.detail;
        moveHandler(resolvePosition(baseEvent, slide).add(centerOffset), baseEvent.shiftKey, baseEvent.altKey);
        slide.broadcastSetGraphic(mutator.getTarget());
    }

    function complete(): void {
        unlisten(SLIDE_EVENTS.MOUSEMOVE, move);
        listenOnce(ELLIPSE_EVENTS.MOUSEDOWN, moveEllipse);
    }
}

export function moveEllipseVertex(mutator: EllipseMutator, vertex: VertexRenderer, moveVertex: (event: VertexMouseEvent) => void) {
    const handler = mutator.getVertexHandler(vertex.getRole());

    listen(SLIDE_EVENTS.MOUSEMOVE, move);
    listenOnce(SLIDE_EVENTS.MOUSEUP, complete);

    function move(event: SlideMouseEvent): void {
        const { slide, baseEvent } = event.detail;
        handler(resolvePosition(baseEvent, slide), baseEvent.shiftKey);
        slide.broadcastSetGraphic(mutator.getTarget());
    }

    function complete(): void {
        unlisten(SLIDE_EVENTS.MOUSEMOVE, move);
        listenOnce(VERTEX_EVENTS.MOUSEDOWN, moveVertex);
    }
}

export function hoverEllipse(event: EllipseMouseEvent): void {
    const { target, slide } = event.detail;

    if (slide.isFocused(target.getId())) {
        return;
    }

    slide.markGraphic(target.getId());

    listenOnce(ELLIPSE_EVENTS.MOUSEOUT, unmark);
    function unmark(): void {
        slide.unmarkGraphic(target.getId());
    }
}
