import { listen, listenOnce, unlisten } from '@/events';
import { SlideKeyboardEvent, SlideMouseEvent, SLIDE_EVENTS } from '@/events/types';
import { AppStore } from '@/store/types';
import { PointerTool } from '.';
import { EditorTool, TOOL_NAMES } from './types';
import { mouseEventFromKeyDownEvent, mouseEventFromKeyUpEvent, resolvePosition } from './utilities';

export default (store: AppStore): EditorTool => {
    function make(event: SlideMouseEvent): void {
        const { slide, baseEvent } = event.detail;
        const maker = slide.makeRectangleInteractive(resolvePosition(baseEvent, slide));
        slide.broadcastSetGraphic(maker.target);

        // Start tracking the last mouse event so keypress handlers can emulate mouse events
        let lastMouseEvent = event;
        const resizeListener = maker.resizeListener();

        listen(SLIDE_EVENTS.KEYDOWN, 'keyDownHandler', keyDownHandler);
        listen(SLIDE_EVENTS.KEYUP, 'keyUpHandler', keyUpHandler);
        listen(SLIDE_EVENTS.MOUSEMOVE, 'update', update);
        listenOnce(SLIDE_EVENTS.MOUSEUP, 'complete', complete);

        function keyDownHandler(event: SlideKeyboardEvent): void {
            mouseEventFromKeyDownEvent(event, lastMouseEvent);
        }

        function keyUpHandler(event: SlideKeyboardEvent): void {
            mouseEventFromKeyUpEvent(event, lastMouseEvent);
        }

        function update(event: SlideMouseEvent): void {
            resizeListener(event);
            slide.broadcastSetGraphic(maker.target);
            lastMouseEvent = event;
        }

        function complete(): void {
            maker.complete();
            unlisten(SLIDE_EVENTS.MOUSEMOVE, 'update');
            unlisten(SLIDE_EVENTS.KEYDOWN, 'keyDownHandler');
            unlisten(SLIDE_EVENTS.KEYUP, 'keyUpHandler');

            store.mutations.setActiveTool(PointerTool());
        }
    }

    return {
        name: TOOL_NAMES.RECTANGLE,
        mount: () => listenOnce(SLIDE_EVENTS.MOUSEDOWN, 'make', make),
        unmount: () => unlisten(SLIDE_EVENTS.MOUSEDOWN, 'make')
    };
};
