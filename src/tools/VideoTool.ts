import { listen, listenOnce, unlisten } from '@/events';
import { SlideKeyboardEvent, SlideMouseEvent, SLIDE_EVENTS } from '@/events/types';
import { AppStore } from '@/store/types';
import V from '@/utilities/Vector';
import { PointerTool } from '.';
import { EditorTool, TOOL_NAMES } from './types';
import { mouseEventFromKeyDownEvent, mouseEventFromKeyUpEvent, resolvePosition } from './utilities';

export default (store: AppStore): EditorTool => {
    function seedVideo(videoSource: string, dimensions: V): (event: SlideMouseEvent) => void {
        return function make(event) {
            const { slide, baseEvent } = event.detail;
            const maker = slide.makeVideoInteractive(resolvePosition(baseEvent, slide), videoSource, dimensions);
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
        };
    }

    let make: (event: SlideMouseEvent) => void;
    return {
        name: TOOL_NAMES.VIDEO,
        mount: async() => {
            const uploadVideo = new Promise<{ source: string; width: number; height: number }>(resolve => {
                const videoLink = prompt('YouTube link:');
                if (videoLink !== null) {
                    resolve({
                        source: videoLink,
                        width: 480,
                        height: 270
                    });
                }
            });

            const video = await uploadVideo;
            make = seedVideo(video.source, new V(video.width, video.height));
            listenOnce(SLIDE_EVENTS.MOUSEDOWN, 'make', make);
        },
        unmount: () => unlisten(SLIDE_EVENTS.MOUSEDOWN, 'make')
    };
};
