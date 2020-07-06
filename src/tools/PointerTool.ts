import { GraphicMouseEvent, GRAPHIC_EVENTS, SlideMouseEvent, SLIDE_EVENTS, SlideKeyboardEvent, EVENT_CATEGORIES } from "../events/types";
import { listen, unlisten } from "../events/utilities";
import { RectangleRenderer } from "../rendering/graphics";
import { RectangleMutator } from "../rendering/mutators";
import { GRAPHIC_TYPES } from "../rendering/types";
import { EditorTool, TOOL_NAMES } from "./types";
import { resolvePosition } from "./utilities";
import { AppStore, MUTATIONS } from "../store/types";
import { PointerTool } from ".";

export default (store: AppStore): EditorTool => {
    function mutate(event: GraphicMouseEvent): void {
        const { slideRenderer, graphicId } = event.detail;
        const graphic = slideRenderer.getGraphic(graphicId);

        if (graphic.type === GRAPHIC_TYPES.RECTANGLE) {
            mutateRectangle(store, event);
        }
    }

    // TODO: Consider the implications of RectangleMouseEvent, CurveMouseEvent, etc. instead of GraphicMouseEvent
    function mutateRectangle(store: AppStore, event: GraphicMouseEvent): void {
        const { slideRenderer, graphicId } = event.detail;
        const rectangle = slideRenderer.getGraphic(graphicId) as RectangleRenderer;
        const mutator = new RectangleMutator({ slide: slideRenderer, rectangle });
        beginMove(event);

        unlisten(GRAPHIC_EVENTS.MOUSEDOWN, mutate);
        listen(SLIDE_EVENTS.MOUSEDOWN, complete);
        listen(SLIDE_EVENTS.KEYDOWN, complete);

        function beginMove(event: SlideMouseEvent | GraphicMouseEvent): void {
            const position = resolvePosition(event.detail.baseEvent, slideRenderer, store);
            const originOffset = position.towards(rectangle.origin);

            unlisten(SLIDE_EVENTS.MOUSEDOWN, beginMove);
            listen(SLIDE_EVENTS.MOUSEMOVE, move);
            listen(SLIDE_EVENTS.MOUSEUP, endMove);
            listen(SLIDE_EVENTS.KEYDOWN, endMove);

            function move(event: SlideMouseEvent): void {
                const position = resolvePosition(event.detail.baseEvent, slideRenderer, store);
                mutator.move(position.add(originOffset));
            }

            function endMove(event: SlideMouseEvent | SlideKeyboardEvent): void {
                // Ignore keyboard event if the user did not press any of the specified keys
                if (event.detail.category === EVENT_CATEGORIES.SLIDE_KEYBOARD) {
                    const keyboardEvent = event as SlideKeyboardEvent;
                    if (['Tab', 'Enter', 'Escape'].indexOf(keyboardEvent.detail.baseEvent.key) === -1) {
                        return;
                    }
                }

                unlisten(SLIDE_EVENTS.MOUSEUP, endMove);
                unlisten(SLIDE_EVENTS.KEYDOWN, endMove);
                unlisten(SLIDE_EVENTS.MOUSEMOVE, move);
                listen(SLIDE_EVENTS.MOUSEDOWN, beginMove);
            }
        }

        function complete(event: SlideMouseEvent | SlideKeyboardEvent): void {
            // Ignore keyboard event if the user did not press any of the specified keys
            if (event.detail.category === EVENT_CATEGORIES.SLIDE_KEYBOARD) {
                const keyboardEvent = event as SlideKeyboardEvent;
                if (['Tab', 'Enter', 'Escape'].indexOf(keyboardEvent.detail.baseEvent.key) === -1) {
                    return;
                }
            }

            // TODO: Implement method for checking if another graphic was clicked
            // Ignore mouse event if the user clicked on the current graphic or another graphic
            if (event.detail.isElementEvent) {
                return;
            }

            mutator.complete();
            listen(GRAPHIC_EVENTS.MOUSEDOWN, mutate);
            unlisten(SLIDE_EVENTS.MOUSEDOWN, beginMove);
            unlisten(SLIDE_EVENTS.MOUSEUP, complete);
            unlisten(SLIDE_EVENTS.KEYDOWN, complete);
        }
    }

    return {
        name: TOOL_NAMES.POINTER,
        mount: () => listen(GRAPHIC_EVENTS.MOUSEDOWN, mutate),
        unmount: () => unlisten(GRAPHIC_EVENTS.MOUSEDOWN, mutate)
    };
};
