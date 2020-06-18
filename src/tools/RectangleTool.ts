import { SlideMouseEvent, SLIDE_EVENTS } from "../events/types";
import { listen, unlisten } from "../events/utilities";
import { resolvePosition } from "./utilities";
import { EditorTool, TOOL_NAMES } from "./types";

export default function rectangleTool(store: any): EditorTool {
    console.log('Initialized Rectangle Tool');

    function make(event: SlideMouseEvent): void {
        const { slideRenderer, baseEvent } = event.detail;

        const initialPosition = resolvePosition(baseEvent, slideRenderer, store);
        const maker = slideRenderer.startMakingRectangle();
        maker.move(initialPosition);

        unlisten(SLIDE_EVENTS.MOUSEDOWN, make);
        listen(SLIDE_EVENTS.MOUSEMOVE, update);
        listen(SLIDE_EVENTS.MOUSEUP, complete);

        function update(event: SlideMouseEvent): void {
            const { baseEvent } = event.detail;

            // TODO: Incorporate shift, alt, ctrl, and snapping into position calculation
            // TODO: Handle ctrl case (symmetric around center)
            const position = resolvePosition(baseEvent, slideRenderer, store);
            maker.setDimensions(initialPosition.towards(position));
        }

        function complete(): void {
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
}
