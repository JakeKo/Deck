import { listen, listenOnce, unlisten } from '@/events';
import { SlideKeyboardEvent, SlideMouseEvent, SLIDE_EVENTS } from '@/events/types';
import { GRAPHIC_TYPES, IVideoCreator } from '@/rendering/types';
import { AppStore } from '@/store/types';
import { provideId } from '@/utilities/IdProvider';
import V from '@/utilities/Vector';
import { PointerTool } from '.';
import { EditorTool, TOOL_NAMES } from './types';
import { mouseEventFromKeyDownEvent, mouseEventFromKeyUpEvent, resolvePosition } from './utilities';

export default (store: AppStore): EditorTool => {
    function seedVideo(videoSource: string, dimensions: V): (event: SlideMouseEvent) => void {
        return function make(event) {
            const { slide, baseEvent } = event.detail;
            const graphicId = provideId();
            const maker = slide.initInteractiveCreate(graphicId, GRAPHIC_TYPES.VIDEO) as IVideoCreator;
            slide.createGraphic(maker.create({ source: videoSource, dimensions }));

            let lastMouseEvent = event;
            const resizeHandler = maker.initResize(resolvePosition(baseEvent, slide));

            listen(SLIDE_EVENTS.KEYDOWN, 'video--key-down-handler', keyDownHandler);
            listen(SLIDE_EVENTS.KEYUP, 'video--key-up-handler', keyUpHandler);
            listen(SLIDE_EVENTS.MOUSEMOVE, 'video--update', update);
            listenOnce(SLIDE_EVENTS.MOUSEUP, 'video--complete', complete);

            function keyDownHandler(event: SlideKeyboardEvent): void {
                mouseEventFromKeyDownEvent(event, lastMouseEvent);
            }

            function keyUpHandler(event: SlideKeyboardEvent): void {
                mouseEventFromKeyUpEvent(event, lastMouseEvent);
            }

            function update(event: SlideMouseEvent): void {
                const deltas = resizeHandler(event);
                slide.setProps(graphicId, GRAPHIC_TYPES.VIDEO, deltas);
                lastMouseEvent = event;
            }

            function complete(event: SlideMouseEvent): void {
                update(event);
                maker.endResize();

                unlisten(SLIDE_EVENTS.MOUSEMOVE, 'video--update');
                unlisten(SLIDE_EVENTS.KEYDOWN, 'video--key-down-handler');
                unlisten(SLIDE_EVENTS.KEYUP, 'video--key-up-handler');

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
