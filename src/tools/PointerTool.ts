import { RectangleMouseEvent, RECTANGLE_EVENTS, SlideMouseEvent, SLIDE_EVENTS } from "../events/types";
import { listen, listenOnce, unlisten } from "../events/utilities";
import { RectangleMutator } from "../rendering/mutators";
import { AppStore } from "../store/types";
import { EditorTool, TOOL_NAMES } from "./types";
import { resolvePosition } from "./utilities";

export default (store: AppStore): EditorTool => {
    const rectangleMutation = initRectangleMutation(store);

    return {
        name: TOOL_NAMES.POINTER,
        mount: () => {
            listenOnce(RECTANGLE_EVENTS.MOUSEDOWN, rectangleMutation);
            listen(SLIDE_EVENTS.MOUSEDOWN, reevaluateFocusedGraphics);
        },
        unmount: () => {
            unlisten(RECTANGLE_EVENTS.MOUSEDOWN, rectangleMutation);
            unlisten(SLIDE_EVENTS.MOUSEDOWN, reevaluateFocusedGraphics);
        }
    };
};

function reevaluateFocusedGraphics(event: SlideMouseEvent): void {
    const { slide, target } = event.detail;

    if (target === undefined) {
        slide.unfocusAllGraphics();
    } else {
        slide.focusGraphic(target.getId());
    }
}

function initRectangleMutation(store: AppStore): (event: RectangleMouseEvent) => void {
    return function begin(event) {
        const { slide, baseEvent, target } = event.detail;
        const originOffset = resolvePosition(baseEvent, slide, store).towards(target.getOrigin());
        const mutator = slide.focusGraphic(target.getId()) as RectangleMutator;

        listen(SLIDE_EVENTS.MOUSEMOVE, move);
        listenOnce(SLIDE_EVENTS.MOUSEUP, complete);

        function move(event: SlideMouseEvent): void {
            const { slide, baseEvent } = event.detail;
            mutator.move(resolvePosition(baseEvent, slide, store).add(originOffset));
            slide.broadcastSetGraphic(mutator.getTarget());
        }

        function complete(): void {
            unlisten(SLIDE_EVENTS.MOUSEMOVE, move);
            listenOnce(RECTANGLE_EVENTS.MOUSEDOWN, begin);
        }
    };
}
