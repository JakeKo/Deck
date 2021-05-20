import { listen, listenOnce, unlisten } from '@/events';
import { SlideKeyboardEvent, SlideMouseEvent, SLIDE_EVENTS } from '@/events/types';
import { GRAPHIC_TYPES, ITextboxCreator } from '@/rendering/types';
import { AppStore } from '@/store/types';
import { provideId } from '@/utilities/IdProvider';
import { PointerTool } from '.';
import { EditorTool, TOOL_NAMES } from './types';
import { mouseEventFromKeyDownEvent, mouseEventFromKeyUpEvent, resolvePosition } from './utilities';

export default (store: AppStore): EditorTool => {
    function make(event: SlideMouseEvent): void {
        const { slide, baseEvent } = event.detail;
        const graphicId = provideId();
        const maker = slide.initInteractiveCreate(graphicId, GRAPHIC_TYPES.TEXTBOX) as ITextboxCreator;
        slide.createGraphic(maker.create({}));

        let lastMouseEvent = event;
        const resizeHandler = maker.initResize(resolvePosition(baseEvent, slide));

        listen(SLIDE_EVENTS.KEYDOWN, 'textbox--key-down-handler', keyDownHandler);
        listen(SLIDE_EVENTS.KEYUP, 'textbox--key-up-handler', keyUpHandler);
        listen(SLIDE_EVENTS.MOUSEMOVE, 'textbox--update', update);
        listenOnce(SLIDE_EVENTS.MOUSEUP, 'textbox--complete', complete);

        function keyDownHandler(event: SlideKeyboardEvent): void {
            mouseEventFromKeyDownEvent(event, lastMouseEvent);
        }

        function keyUpHandler(event: SlideKeyboardEvent): void {
            mouseEventFromKeyUpEvent(event, lastMouseEvent);
        }

        function update(event: SlideMouseEvent): void {
            const deltas = resizeHandler(event);
            slide.setProps(graphicId, GRAPHIC_TYPES.TEXTBOX, deltas);
            lastMouseEvent = event;
        }

        function complete(event: SlideMouseEvent): void {
            update(event);
            maker.endResize();

            unlisten(SLIDE_EVENTS.MOUSEMOVE, 'textbox--update');
            unlisten(SLIDE_EVENTS.KEYDOWN, 'textbox--key-down-handler');
            unlisten(SLIDE_EVENTS.KEYUP, 'textbox--key-up-handler');

            store.mutations.setActiveTool(PointerTool());
        }
    }

    return {
        name: TOOL_NAMES.TEXTBOX,
        mount: () => listenOnce(SLIDE_EVENTS.MOUSEDOWN, 'make', make),
        unmount: () => unlisten(SLIDE_EVENTS.MOUSEDOWN, 'make')
    };
};
