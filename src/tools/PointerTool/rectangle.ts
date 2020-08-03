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
        listenOnce(RECTANGLE_EVENTS.MOUSEDOWN, moveRectangle);
    }
}

export function moveRectangleVertex(mutator: RectangleMutator, vertex: VertexRenderer, moveVertex: (event: VertexMouseEvent) => void) {
    // Handler must be instantiated at the beginning of the mutation to capture initial state
    // Handler cannot be instantiated immediately during each move event
    const handler = mutator.boxListeners[vertex.getRole()];

    listen(SLIDE_EVENTS.MOUSEMOVE, move);
    listenOnce(SLIDE_EVENTS.MOUSEUP, complete);

    function move(event: SlideMouseEvent): void {
        handler(event);
        event.detail.slide.broadcastSetGraphic(mutator.getTarget());
    }

    function complete(): void {
        unlisten(SLIDE_EVENTS.MOUSEMOVE, move);
        listenOnce(VERTEX_EVENTS.MOUSEDOWN, moveVertex);
    }
}

// TODO: Consider how to not mark while actively mutating graphics
export function hoverRectangle(event: RectangleMouseEvent): void {
    const { target, slide } = event.detail;

    if (slide.isFocused(target.getId())) {
        return;
    }

    slide.markGraphic(target.getId());

    listenOnce(RECTANGLE_EVENTS.MOUSEOUT, unmark);
    function unmark(): void {
        slide.unmarkGraphic(target.getId());
    }
}
