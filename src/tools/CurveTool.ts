import { listen, listenOnce, unlisten } from '@/events';
import { SlideKeyboardEvent, SlideMouseEvent, SLIDE_EVENTS } from '@/events/types';
import { AppStore } from '@/store/types';
import { PointerTool } from '.';
import { EditorTool, TOOL_NAMES } from './types';
import { resolvePosition } from './utilities';

export default (store: AppStore): EditorTool => {
    function make(event: SlideMouseEvent): void {
        const { slide, baseEvent } = event.detail;
        const initialPosition = resolvePosition(baseEvent, slide);
        const maker = slide.makeCurveInteractive(initialPosition);
        slide.broadcastSetGraphic(maker.target);

        let anchorListeners = maker.anchorListeners({ inHandle: initialPosition, point: initialPosition, outHandle: initialPosition });
        setPoint();

        listen(SLIDE_EVENTS.KEYDOWN, 'complete', complete);

        function movePoint(event: SlideMouseEvent): void {
            anchorListeners.setPoint(event);
            anchorListeners.setHandles(event);
            slide.broadcastSetGraphic(maker.target);
        }

        function setPoint(): void {
            unlisten(SLIDE_EVENTS.MOUSEMOVE, 'movePoint');
            listen(SLIDE_EVENTS.MOUSEMOVE, 'moveHandles', moveHandles);
            listenOnce(SLIDE_EVENTS.MOUSEUP, 'setHandles', setHandles);
        }

        function moveHandles(event: SlideMouseEvent): void {
            anchorListeners.setHandles(event);
            slide.broadcastSetGraphic(maker.target);
        }

        function setHandles(event: SlideMouseEvent): void {
            const position = resolvePosition(event.detail.baseEvent, slide);
            anchorListeners = maker.anchorListeners({ inHandle: position, point: position, outHandle: position });
            slide.broadcastSetGraphic(maker.target);

            unlisten(SLIDE_EVENTS.MOUSEMOVE, 'moveHandles');
            listen(SLIDE_EVENTS.MOUSEMOVE, 'movePoint', movePoint);
            listenOnce(SLIDE_EVENTS.MOUSEDOWN, 'setPoint', setPoint);
        }

        function complete(event: SlideKeyboardEvent): void {
            if (['Enter', 'Escape'].indexOf(event.detail.baseEvent.key) === -1) {
                return;
            }

            maker.complete();
            unlisten(SLIDE_EVENTS.MOUSEMOVE, 'movePoint');
            unlisten(SLIDE_EVENTS.MOUSEDOWN, 'setPoint');
            unlisten(SLIDE_EVENTS.MOUSEMOVE, 'moveHandles');
            unlisten(SLIDE_EVENTS.MOUSEUP, 'setHandles');
            unlisten(SLIDE_EVENTS.KEYDOWN, 'complete');

            store.mutations.setActiveTool(PointerTool());
        }
    }

    return {
        name: TOOL_NAMES.CURVE,
        mount: () => listenOnce(SLIDE_EVENTS.MOUSEDOWN, 'make', make),
        unmount: () => unlisten(SLIDE_EVENTS.MOUSEDOWN, 'make')
    };
};
