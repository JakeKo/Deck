import { GraphicMouseEvent, GRAPHIC_EVENTS, SlideMouseEvent, SLIDE_EVENTS } from "../events/types";
import { listen, unlisten } from "../events/utilities";
import { RectangleRenderer } from "../rendering/graphics";
import { RectangleMutator } from "../rendering/mutators";
import { GRAPHIC_TYPES } from "../rendering/types";
import { EditorTool, TOOL_NAMES } from "./types";
import { resolvePosition } from "./utilities";
import { AppStore } from "../store/types";

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
        const position = resolvePosition(event.detail.baseEvent, slideRenderer, store);
        const originOffset = position.towards(rectangle.origin);

        unlisten(GRAPHIC_EVENTS.MOUSEDOWN, mutate);
        listen(SLIDE_EVENTS.MOUSEMOVE, move);
        listen(SLIDE_EVENTS.MOUSEUP, complete);

        function move(event: SlideMouseEvent): void {
            const position = resolvePosition(event.detail.baseEvent, slideRenderer, store);
            mutator.move(position.add(originOffset));
        }

        function complete(): void {
            mutator.complete();

            listen(GRAPHIC_EVENTS.MOUSEDOWN, mutate);
            unlisten(SLIDE_EVENTS.MOUSEMOVE, move);
            unlisten(SLIDE_EVENTS.MOUSEUP, complete);
        }
    }

    return {
        name: TOOL_NAMES.POINTER,
        mount: () => listen(GRAPHIC_EVENTS.MOUSEDOWN, mutate),
        unmount: () => unlisten(GRAPHIC_EVENTS.MOUSEDOWN, mutate)
    };
};
