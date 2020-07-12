import { SlideKeyboardEvent, SlideMouseEvent, SLIDE_EVENTS } from "../events/types";
import { listen, unlisten } from "../events/utilities";
import { CurveMaker } from "../rendering/makers";
import { AppStore, MUTATIONS } from "../store/types";
import PointerTool from "./PointerTool";
import { EditorTool, TOOL_NAMES } from "./types";
import { resolvePosition } from "./utilities";

export default (store: AppStore): EditorTool => {
    function make(event: SlideMouseEvent): void {
        const { slide, baseEvent } = event.detail;
        const initialPosition = resolvePosition(baseEvent, slide, store);
        const maker = new CurveMaker({
            slide: slide,
            initialPosition
        });
        slide.broadcastSetGraphic(maker.getTarget());

        let currentAnchor = maker.addAnchor({ inHandle: initialPosition, point: initialPosition, outHandle: initialPosition });
        setPoint();

        unlisten(SLIDE_EVENTS.MOUSEDOWN, make);
        listen(SLIDE_EVENTS.KEYDOWN, complete);

        function movePoint(event: SlideMouseEvent): void {
            const position = resolvePosition(event.detail.baseEvent, slide, store);
            currentAnchor.setPoint(position);
            currentAnchor.setHandles(position);
            slide.broadcastSetGraphic(maker.getTarget());
        }

        function setPoint(): void {
            unlisten(SLIDE_EVENTS.MOUSEMOVE, movePoint);
            unlisten(SLIDE_EVENTS.MOUSEDOWN, setPoint);
            listen(SLIDE_EVENTS.MOUSEMOVE, moveHandles);
            listen(SLIDE_EVENTS.MOUSEUP, setHandles);
        }

        function moveHandles(event: SlideMouseEvent): void {
            const position = resolvePosition(event.detail.baseEvent, slide, store);
            currentAnchor.setHandles(position);
            slide.broadcastSetGraphic(maker.getTarget());
        }

        function setHandles(): void {
            const position = resolvePosition(event.detail.baseEvent, slide, store);
            currentAnchor = maker.addAnchor({ inHandle: position, point: position, outHandle: position });
            slide.broadcastSetGraphic(maker.getTarget());

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

            store.commit(MUTATIONS.ACTIVE_TOOL, PointerTool(store));
        }
    }

    return {
        name: TOOL_NAMES.CURVE,
        mount: () => listen(SLIDE_EVENTS.MOUSEDOWN, make),
        unmount: () => unlisten(SLIDE_EVENTS.MOUSEDOWN, make)
    };
};
