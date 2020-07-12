import { RectangleMouseEvent, RECTANGLE_EVENTS, SlideMouseEvent, SLIDE_EVENTS } from "../events/types";
import { listen, unlisten } from "../events/utilities";
import { RectangleRenderer } from "../rendering/graphics";
import { RectangleMutator } from "../rendering/mutators";
import { AppStore } from "../store/types";
import Vector from "../utilities/Vector";
import { EditorTool, TOOL_NAMES } from "./types";
import { resolvePosition } from "./utilities";

type MutationControls = {
    begin: (event: CustomEvent) => void;
    complete: (event: CustomEvent) => void;
    stop: () => void;
};

export default (store: AppStore): EditorTool => {
    const rectangleMutation = initRectangleMutation(store);

    return {
        name: TOOL_NAMES.POINTER,
        mount: () => {
            listen(RECTANGLE_EVENTS.MOUSEDOWN, rectangleMutation.begin);
        },
        unmount: () => {
            rectangleMutation.stop();
            unlisten(RECTANGLE_EVENTS.MOUSEDOWN, rectangleMutation.begin);
        }
    };
};

function initRectangleMutation(store: AppStore): MutationControls {
    let mutator: RectangleMutator | undefined;
    let originOffset: Vector | undefined;
    let rectangle: RectangleRenderer | undefined;

    function begin(event: RectangleMouseEvent): void {
        const { slide, target } = event.detail;
        rectangle = target;
        mutator = new RectangleMutator({ slide, rectangle });
        beginMove(event);

        unlisten(RECTANGLE_EVENTS.MOUSEDOWN, begin);
        listen(SLIDE_EVENTS.MOUSEDOWN, complete);
    }

    function beginMove(event: RectangleMouseEvent): void {
        const { slide, baseEvent } = event.detail;
        const position = resolvePosition(baseEvent, slide, store);
        originOffset = position.towards(rectangle!.getOrigin());
        slide.broadcastSetGraphic(mutator!.getTarget());

        unlisten(RECTANGLE_EVENTS.MOUSEDOWN, beginMove);
        listen(SLIDE_EVENTS.MOUSEMOVE, move);
        listen(SLIDE_EVENTS.MOUSEUP, completeMove);
    }

    function move(event: SlideMouseEvent): void {
        const { slide, baseEvent } = event.detail;
        const position = resolvePosition(baseEvent, slide, store);
        mutator!.move(position.add(originOffset!));
        slide.broadcastSetGraphic(mutator!.getTarget());
    }

    function completeMove(): void {
        listen(RECTANGLE_EVENTS.MOUSEDOWN, beginMove);
        unlisten(SLIDE_EVENTS.MOUSEMOVE, move);
        unlisten(SLIDE_EVENTS.MOUSEUP, completeMove);
    }

    function complete(event: SlideMouseEvent): void {
        // Ignore event if the user clicked on the current graphic
        if (event.detail.target && rectangle && event.detail.target.getId() === rectangle.getId()) {
            return;
        }

        // TODO: Implement method for switching to other graphic if clicked on

        mutator && mutator.complete();
        mutator = undefined;
        listen(RECTANGLE_EVENTS.MOUSEDOWN, begin);
        unlisten(RECTANGLE_EVENTS.MOUSEDOWN, beginMove);
        unlisten(SLIDE_EVENTS.MOUSEMOVE, move);
        unlisten(SLIDE_EVENTS.MOUSEUP, completeMove);
        unlisten(SLIDE_EVENTS.MOUSEDOWN, complete);
    }

    function stop(): void {
        mutator && mutator.complete();
        unlisten(RECTANGLE_EVENTS.MOUSEDOWN, begin);
        unlisten(RECTANGLE_EVENTS.MOUSEDOWN, beginMove);
        unlisten(SLIDE_EVENTS.MOUSEMOVE, move);
        unlisten(SLIDE_EVENTS.MOUSEUP, completeMove);
        unlisten(SLIDE_EVENTS.MOUSEDOWN, complete);
    }

    return { begin, complete, stop };
}
