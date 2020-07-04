import { SlideMouseEvent, SLIDE_EVENTS } from "../events/types";
import { listen, unlisten } from "../events/utilities";
import { EditorTool, TOOL_NAMES } from "./types";
import { resolvePosition } from "./utilities";

export default (store: any): EditorTool => {
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

            // TODO: Determine if snapping, shift, etc. should be handled here
            // TODO: Handle ctrl case (symmetric around center)
            // TODO: Figure out how to reflect rectangle as it is being drawn
            const position = resolvePosition(baseEvent, slideRenderer, store);
            const rawDimensions = initialPosition.towards(position);
            const trueDimensions = rawDimensions.transform(Math.abs);
            const relativeOrigin = rawDimensions.scale(0.5).add(trueDimensions.scale(-0.5));

            maker.move(initialPosition.add(relativeOrigin));
            maker.resize(trueDimensions);
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
