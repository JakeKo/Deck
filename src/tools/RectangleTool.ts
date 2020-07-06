import { PointerTool } from ".";
import { SlideMouseEvent, SLIDE_EVENTS } from "../events/types";
import { listen, unlisten } from "../events/utilities";
import { RectangleMaker } from "../rendering/makers";
import { AppStore, MUTATIONS } from "../store/types";
import { EditorTool, TOOL_NAMES } from "./types";
import { resolvePosition } from "./utilities";

export default (store: AppStore): EditorTool => {
    function make(event: SlideMouseEvent): void {
        const { slide, baseEvent } = event.detail;
        const maker = new RectangleMaker({
            slide,
            initialPosition: resolvePosition(baseEvent, slide, store)
        });

        listen(SLIDE_EVENTS.MOUSEMOVE, update);
        listen(SLIDE_EVENTS.MOUSEUP, complete);

        function update(event: SlideMouseEvent): void {
            const { baseEvent } = event.detail;
            const position = resolvePosition(baseEvent, slide, store);
            maker.resize(position, baseEvent.shiftKey, baseEvent.ctrlKey, baseEvent.altKey);
        }

        function complete(): void {
            maker.complete();
            unlisten(SLIDE_EVENTS.MOUSEMOVE, update);
            unlisten(SLIDE_EVENTS.MOUSEUP, complete);

            store.commit(MUTATIONS.ACTIVE_TOOL, PointerTool(store));
        }
    }

    return {
        name: TOOL_NAMES.RECTANGLE,
        mount: () => listen(SLIDE_EVENTS.MOUSEDOWN, make),
        unmount: () => unlisten(SLIDE_EVENTS.MOUSEDOWN, make)
    };
};
