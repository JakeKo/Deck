import { SlideMouseEvent, SLIDE_EVENTS } from "../events/types";
import { listen, unlisten } from "../events/utilities";
import { RectangleMaker } from "../rendering/makers";
import { AppStore } from "../store/types";
import { EditorTool, TOOL_NAMES } from "./types";
import { resolvePosition } from "./utilities";

export default (store: AppStore): EditorTool => {
    function make(event: SlideMouseEvent): void {
        const { slideRenderer, baseEvent } = event.detail;
        const maker = new RectangleMaker({
            slide: slideRenderer,
            initialPosition: resolvePosition(baseEvent, slideRenderer, store)
        });

        unlisten(SLIDE_EVENTS.MOUSEDOWN, make);
        listen(SLIDE_EVENTS.MOUSEMOVE, update);
        listen(SLIDE_EVENTS.MOUSEUP, complete);

        function update(event: SlideMouseEvent): void {
            const { baseEvent } = event.detail;
            const position = resolvePosition(baseEvent, slideRenderer, store);
            maker.resize(position, baseEvent.shiftKey, baseEvent.ctrlKey, baseEvent.altKey);
        }

        function complete(): void {
            maker.complete();
            listen(SLIDE_EVENTS.MOUSEDOWN, make);
            unlisten(SLIDE_EVENTS.MOUSEMOVE, update);
            unlisten(SLIDE_EVENTS.MOUSEUP, complete);
        }
    }

    return {
        name: TOOL_NAMES.RECTANGLE,
        mount: () => listen(SLIDE_EVENTS.MOUSEDOWN, make),
        unmount: () => unlisten(SLIDE_EVENTS.MOUSEDOWN, make)
    };
};
