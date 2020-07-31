import { SlideMouseEvent, SLIDE_EVENTS, VertexMouseEvent, VERTEX_EVENTS, VideoMouseEvent, VIDEO_EVENTS } from "../../events/types";
import { listen, listenOnce, unlisten } from "../../events/utilities";
import { VertexRenderer } from "../../rendering/helpers";
import { VideoMutator } from "../../rendering/mutators";
import { resolvePosition } from "../utilities";

export function moveVideo(event: VideoMouseEvent): void {
    const { slide, baseEvent, target } = event.detail;
    if (!baseEvent.ctrlKey && !slide.isFocused(target.getId())) {
        slide.unfocusAllGraphics([target.getId()]);
    }

    const originOffset = resolvePosition(baseEvent, slide).towards(target.getOrigin());
    const mutator = slide.focusGraphic(target.getId()) as VideoMutator;
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
        listenOnce(VIDEO_EVENTS.MOUSEDOWN, moveVideo);
    }
}

export function moveVideoVertex(mutator: VideoMutator, vertex: VertexRenderer, moveVertex: (event: VertexMouseEvent) => void) {
    const handler = mutator.getVertexHandler(vertex.getRole());

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

export function hoverVideo(event: VideoMouseEvent): void {
    const { target, slide } = event.detail;

    if (slide.isFocused(target.getId())) {
        return;
    }

    slide.markGraphic(target.getId());

    listenOnce(VIDEO_EVENTS.MOUSEOUT, unmark);
    function unmark(): void {
        slide.unmarkGraphic(target.getId());
    }
}
