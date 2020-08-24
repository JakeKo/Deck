import { SlideMouseEvent, SLIDE_EVENTS } from '@/events/types';
import { listen, listenOnce, unlisten } from '@/events/utilities';
import { AppStore } from '@/store/types';
import { PointerTool } from '.';
import { EditorTool, TOOL_NAMES } from './types';
import { resolvePosition } from './utilities';

export default (store: AppStore): EditorTool => {
    function make(event: SlideMouseEvent): void {
        const { slide, baseEvent } = event.detail;
        const maker = slide.makeRectangleInteractive(resolvePosition(baseEvent, slide));
        slide.broadcastSetGraphic(maker.getTarget());

        listen(SLIDE_EVENTS.MOUSEMOVE, update);
        listenOnce(SLIDE_EVENTS.MOUSEUP, complete);

        function update(event: SlideMouseEvent): void {
            const { baseEvent } = event.detail;
            const position = resolvePosition(baseEvent, slide);
            maker.resize(position, baseEvent.shiftKey, baseEvent.ctrlKey, baseEvent.altKey);
            slide.broadcastSetGraphic(maker.getTarget());
        }

        function complete(): void {
            maker.complete();
            unlisten(SLIDE_EVENTS.MOUSEMOVE, update);

            store.setActiveTool(PointerTool());
        }
    }

    return {
        name: TOOL_NAMES.RECTANGLE,
        mount: () => listenOnce(SLIDE_EVENTS.MOUSEDOWN, make),
        unmount: () => unlisten(SLIDE_EVENTS.MOUSEDOWN, make)
    };
};
