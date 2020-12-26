import { SlideMouseEvent, SLIDE_EVENTS } from '@/events/types';
import { listen, listenOnce, unlisten } from '@/events/utilities';
import { AppStore } from '@/store/types';
import Vector from '@/utilities/Vector';
import { PointerTool } from '.';
import { EditorTool, TOOL_NAMES } from './types';
import { resolvePosition } from './utilities';

export default (store: AppStore): EditorTool => {
    function seedVideo(videoSource: string, dimensions: Vector): (event: SlideMouseEvent) => void {
        return function make(event) {
            const { slide, baseEvent } = event.detail;
            const maker = slide.makeVideoInteractive(resolvePosition(baseEvent, slide), videoSource, dimensions);
            slide.broadcastSetGraphic(maker.target);

            const resizeListener = maker.resizeListener();

            listen(SLIDE_EVENTS.MOUSEMOVE, update);
            listenOnce(SLIDE_EVENTS.MOUSEUP, complete);

            function update(event: SlideMouseEvent): void {
                resizeListener(event);
                slide.broadcastSetGraphic(maker.target);
            }

            function complete(): void {
                maker.complete();
                unlisten(SLIDE_EVENTS.MOUSEMOVE, update);

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
            make = seedVideo(video.source, new Vector(video.width, video.height));
            listenOnce(SLIDE_EVENTS.MOUSEDOWN, make);
        },
        unmount: () => unlisten(SLIDE_EVENTS.MOUSEDOWN, make)
    };
};
