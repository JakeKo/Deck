import { RectangleMouseEvent, RECTANGLE_EVENTS, SlideMouseEvent, SLIDE_EVENTS, EllipseMouseEvent, ELLIPSE_EVENTS } from "../events/types";
import { listen, listenOnce, unlisten } from "../events/utilities";
import { RectangleMutator, EllipseMutator } from "../rendering/mutators";
import { AppStore } from "../store/types";
import { EditorTool, TOOL_NAMES } from "./types";
import { resolvePosition } from "./utilities";

export default (store: AppStore): EditorTool => {
    return {
        name: TOOL_NAMES.POINTER,
        mount: () => {
            listenOnce(RECTANGLE_EVENTS.MOUSEDOWN, beginRectangleMove);
            listenOnce(ELLIPSE_EVENTS.MOUSEDOWN, beginEllipseMove);

            listen(SLIDE_EVENTS.MOUSEDOWN, reevaluateFocusedGraphics);
            listen(SLIDE_EVENTS.MOUSEMOVE, reevaluateCursor);
        },
        unmount: () => {
            unlisten(RECTANGLE_EVENTS.MOUSEDOWN, beginRectangleMove);
            unlisten(ELLIPSE_EVENTS.MOUSEDOWN, beginEllipseMove);

            unlisten(SLIDE_EVENTS.MOUSEDOWN, reevaluateFocusedGraphics);
            unlisten(SLIDE_EVENTS.MOUSEMOVE, reevaluateCursor);
        }
    };
};

function reevaluateFocusedGraphics(event: SlideMouseEvent): void {
    const { slide, target } = event.detail;

    if (target === undefined) {
        slide.unfocusAllGraphics();
    }
}

function reevaluateCursor(event: SlideMouseEvent): void {
    const { slide, target } = event.detail;
    slide.setCursor(target === undefined ? 'default' : 'move');
}

function beginRectangleMove(event: RectangleMouseEvent): void {
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
        listenOnce(RECTANGLE_EVENTS.MOUSEDOWN, beginRectangleMove);
    }
}

function beginEllipseMove(event: EllipseMouseEvent): void {
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
        listenOnce(ELLIPSE_EVENTS.MOUSEDOWN, beginEllipseMove);
    }
}
