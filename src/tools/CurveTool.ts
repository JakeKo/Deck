import { AppStore, MUTATIONS } from "../store/types";
import { EditorTool, TOOL_NAMES } from "./types";
import { SlideMouseEvent, SLIDE_EVENTS, SlideKeyboardEvent } from "../events/types";
import { CurveMaker } from "../rendering/makers";
import { resolvePosition } from "./utilities";
import { listen, unlisten } from "../events/utilities";
import PointerTool from "./PointerTool";

export default (store: AppStore): EditorTool => {
    function make(event: SlideMouseEvent): void {
        const { slideRenderer, baseEvent } = event.detail;
        const initialPosition = resolvePosition(baseEvent, slideRenderer, store);
        const maker = new CurveMaker({
            slide: slideRenderer,
            initialPosition
        });

        let currentAnchor = maker.addAnchor({ inHandle: initialPosition, point: initialPosition, outHandle: initialPosition });
        setPoint();

        unlisten(SLIDE_EVENTS.MOUSEDOWN, make);
        listen(SLIDE_EVENTS.KEYDOWN, complete);

        function movePoint(event: SlideMouseEvent): void {
            const position = resolvePosition(event.detail.baseEvent, slideRenderer, store);
            currentAnchor.setPoint(position);
            currentAnchor.setHandles(position);
        }

        function setPoint(): void {
            unlisten(SLIDE_EVENTS.MOUSEMOVE, movePoint);
            unlisten(SLIDE_EVENTS.MOUSEDOWN, setPoint);
            listen(SLIDE_EVENTS.MOUSEMOVE, moveHandles);
            listen(SLIDE_EVENTS.MOUSEUP, setHandles);
        }

        function moveHandles(event: SlideMouseEvent): void {
            const position = resolvePosition(event.detail.baseEvent, slideRenderer, store);
            currentAnchor.setHandles(position);
        }

        function setHandles(): void {
            const position = resolvePosition(event.detail.baseEvent, slideRenderer, store);
            currentAnchor = maker.addAnchor({ inHandle: position, point: position, outHandle: position });

            unlisten(SLIDE_EVENTS.MOUSEMOVE, moveHandles);
            unlisten(SLIDE_EVENTS.MOUSEUP, setHandles);
            listen(SLIDE_EVENTS.MOUSEMOVE, movePoint);
            listen(SLIDE_EVENTS.MOUSEDOWN, setPoint);
        }

        function complete(event: SlideKeyboardEvent): void {
            if (['Enter', 'Escape'].indexOf(event.detail.baseEvent.key) === -1) {
                return;
            }

            maker.complete();
            unlisten(SLIDE_EVENTS.MOUSEMOVE, movePoint);
            unlisten(SLIDE_EVENTS.MOUSEDOWN, setPoint);
            unlisten(SLIDE_EVENTS.MOUSEMOVE, moveHandles);
            unlisten(SLIDE_EVENTS.MOUSEUP, setHandles);
            unlisten(SLIDE_EVENTS.KEYDOWN, complete);
            listen(SLIDE_EVENTS.MOUSEDOWN, make);

            store.commit(MUTATIONS.ACTIVE_TOOL, PointerTool(store));
        }
    }

    return {
        name: TOOL_NAMES.CURVE,
        mount: () => listen(SLIDE_EVENTS.MOUSEDOWN, make),
        unmount: () => unlisten(SLIDE_EVENTS.MOUSEDOWN, make)
    };
};
