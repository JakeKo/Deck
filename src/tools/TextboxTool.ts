import { SlideKeyboardEvent, SlideMouseEvent, SlideMouseEventPayload, SLIDE_EVENTS } from '@/events/types';
import { dispatch, listen, listenOnce, unlisten } from '@/events/utilities';
import { AppStore } from '@/store/types';
import { PointerTool } from '.';
import { EditorTool, TOOL_NAMES } from './types';
import { resolvePosition } from './utilities';

export default (store: AppStore): EditorTool => {
    function make(event: SlideMouseEvent): void {
        const { slide, baseEvent } = event.detail;
        const maker = slide.makeTextboxInteractive(resolvePosition(baseEvent, slide));
        slide.broadcastSetGraphic(maker.target);

        // Start tracking the last mouse event so keypress handlers can emulate mouse events
        let lastMouseEvent = event;
        const resizeListener = maker.resizeListener();

        listen(SLIDE_EVENTS.KEYDOWN, keyDownHandler);
        listen(SLIDE_EVENTS.KEYUP, keyUpHandler);
        listen(SLIDE_EVENTS.MOUSEMOVE, update);
        listenOnce(SLIDE_EVENTS.MOUSEUP, complete);

        // When Shift, Ctrl, or Alt are pressed or unpressed, simulate a mousemove event
        // This allows the renderer to immediately adjust the shape dimensions if need be
        function keyDownHandler(event: SlideKeyboardEvent): void {
            const { baseEvent } = event.detail;
            if (!['Shift', 'Control', 'Alt'].includes(baseEvent.key)) {
                return;
            }

            const mouseEvent = new MouseEvent('mousemeove', {
                clientX: lastMouseEvent.detail.baseEvent.clientX,
                clientY: lastMouseEvent.detail.baseEvent.clientY,
                shiftKey: baseEvent.key === 'Shift' || lastMouseEvent.detail.baseEvent.shiftKey,
                ctrlKey: baseEvent.key === 'Control' || lastMouseEvent.detail.baseEvent.ctrlKey,
                altKey: baseEvent.key === 'Alt' || lastMouseEvent.detail.baseEvent.altKey
            });

            dispatch(new CustomEvent<SlideMouseEventPayload>(
                SLIDE_EVENTS.MOUSEMOVE,
                {
                    detail: {
                        ...lastMouseEvent.detail,
                        baseEvent: mouseEvent
                    }
                }
            ));
        }

        function keyUpHandler(event: SlideKeyboardEvent): void {
            const { baseEvent } = event.detail;
            if (!['Shift', 'Control', 'Alt'].includes(baseEvent.key)) {
                return;
            }

            const mouseEvent = new MouseEvent('mousemeove', {
                clientX: lastMouseEvent.detail.baseEvent.clientX,
                clientY: lastMouseEvent.detail.baseEvent.clientY,
                shiftKey: baseEvent.key !== 'Shift' && lastMouseEvent.detail.baseEvent.shiftKey,
                ctrlKey: baseEvent.key !== 'Control' && lastMouseEvent.detail.baseEvent.ctrlKey,
                altKey: baseEvent.key !== 'Alt' && lastMouseEvent.detail.baseEvent.altKey
            });

            dispatch(new CustomEvent<SlideMouseEventPayload>(
                SLIDE_EVENTS.MOUSEMOVE,
                {
                    detail: {
                        ...lastMouseEvent.detail,
                        baseEvent: mouseEvent
                    }
                }
            ));
        }

        function update(event: SlideMouseEvent): void {
            resizeListener(event);
            slide.broadcastSetGraphic(maker.target);
            lastMouseEvent = event;
        }

        function complete(): void {
            maker.complete();
            unlisten(SLIDE_EVENTS.MOUSEMOVE, update);
            unlisten(SLIDE_EVENTS.KEYDOWN, keyDownHandler);
            unlisten(SLIDE_EVENTS.KEYUP, keyUpHandler);

            store.mutations.setActiveTool(PointerTool());
        }
    }

    return {
        name: TOOL_NAMES.TEXTBOX,
        mount: () => listenOnce(SLIDE_EVENTS.MOUSEDOWN, make),
        unmount: () => unlisten(SLIDE_EVENTS.MOUSEDOWN, make)
    };
};
