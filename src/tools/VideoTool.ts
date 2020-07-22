import { PointerTool } from ".";
import { SlideMouseEvent, SLIDE_EVENTS } from "../events/types";
import { listen, listenOnce, unlisten } from "../events/utilities";
import { AppStore, MUTATIONS } from "../store/types";
import { EditorTool, TOOL_NAMES } from "./types";
import { resolvePosition } from "./utilities";

export default (store: AppStore): EditorTool => {
    function seedVideo(video: HTMLVideoElement, width: number, height: number): (event: SlideMouseEvent) => void {
        return function make(event) {
            const { slide, baseEvent } = event.detail;
            const maker = slide.makeVideoInteractive(resolvePosition(baseEvent, slide), video, width, height);
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

                store.commit(MUTATIONS.ACTIVE_TOOL, PointerTool(store));
            }
        };
    }

    let make: (event: SlideMouseEvent) => void;
    return {
        name: TOOL_NAMES.VIDEO,
        mount: async () => {
            const uploadVideo = new Promise<{ source: HTMLVideoElement, width: number, height: number }>(resolve => {
                const reader = new FileReader();
                const input = document.createElement('input');
                input.type = 'file';

                input.addEventListener('input', (): void => reader.readAsDataURL((input as HTMLInputElement).files![0]));
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
            make = seedVideo(video.source, video.width, video.height);
            listenOnce(SLIDE_EVENTS.MOUSEDOWN, make);
        },
        unmount: () => unlisten(SLIDE_EVENTS.MOUSEDOWN, make)
    };
};
