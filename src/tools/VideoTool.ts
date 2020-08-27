import { SlideMouseEvent, SLIDE_EVENTS } from '@/events/types';
import { listen, listenOnce, unlisten } from '@/events/utilities';
import { AppStore } from '@/store/types';
import Vector from '@/utilities/Vector';
import { PointerTool } from '.';
import { EditorTool, TOOL_NAMES } from './types';
import { resolvePosition } from './utilities';

export default (store: AppStore): EditorTool => {
    function seedVideo(video: HTMLVideoElement, dimensions: Vector): (event: SlideMouseEvent) => void {
        return function make(event) {
            const { slide, baseEvent } = event.detail;
            const maker = slide.makeVideoInteractive(resolvePosition(baseEvent, slide), video, dimensions);
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

                store.setActiveTool(PointerTool());
            }
        };
    }

    let make: (event: SlideMouseEvent) => void;
    return {
        name: TOOL_NAMES.VIDEO,
        mount: async() => {
            const uploadVideo = new Promise<{ source: HTMLVideoElement; width: number; height: number }>(resolve => {
                const reader = new FileReader();
                const input = document.createElement('input');
                input.type = 'file';

                input.addEventListener('input', (): void => reader.readAsDataURL(input.files ? input.files[0] : new Blob()));
                reader.addEventListener('loadend', (): void => {
                    // Wait for the video width and height to be determined
                    const video = document.createElement('video');
                    video.src = reader.result as string;
                    video.addEventListener('load', (): void => resolve({
                        source: video,
                        width: video.width,
                        height: video.height
                    }));
                });

                input.click();
            });

            const video = await uploadVideo;
            make = seedVideo(video.source, new Vector(video.width, video.height));
            listenOnce(SLIDE_EVENTS.MOUSEDOWN, make);
        },
        unmount: () => unlisten(SLIDE_EVENTS.MOUSEDOWN, make)
    };
};
