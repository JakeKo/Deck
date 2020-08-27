import { SlideMouseEvent, SLIDE_EVENTS } from '@/events/types';
import { listen, listenOnce, unlisten } from '@/events/utilities';
import { AppStore } from '@/store/types';
import { PointerTool } from '.';
import { EditorTool, TOOL_NAMES } from './types';
import { resolvePosition } from './utilities';

export default (store: AppStore): EditorTool => {
    function seedImage(image: string, width: number, height: number): (event: SlideMouseEvent) => void {
        return function make(event) {
            const { slide, baseEvent } = event.detail;
            const maker = slide.makeImageInteractive(resolvePosition(baseEvent, slide), image, width, height);
            slide.broadcastSetGraphic(maker.target);

            listen(SLIDE_EVENTS.MOUSEMOVE, update);
            listenOnce(SLIDE_EVENTS.MOUSEUP, complete);

            function update(event: SlideMouseEvent): void {
                const { baseEvent } = event.detail;
                const position = resolvePosition(baseEvent, slide);
                maker.resize(position, baseEvent.shiftKey, baseEvent.ctrlKey, baseEvent.altKey);
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
        name: TOOL_NAMES.IMAGE,
        mount: async() => {
            const uploadImage = new Promise<{ source: string; width: number; height: number }>(resolve => {
                const reader = new FileReader();
                const input = document.createElement('input');
                input.type = 'file';

                input.addEventListener('input', (): void => reader.readAsBinaryString(input.files ? input.files[0] : new Blob()));
                reader.addEventListener('loadend', (): void => {
                    // Wait for the image width and height to be determined
                    const imageUrl = `data:image;base64,${btoa(reader.result as string)}`;
                    const image = document.createElement('img');
                    image.src = imageUrl;
                    image.addEventListener('load', (): void => resolve({
                        source: imageUrl,
                        width: image.width,
                        height: image.height
                    }));
                });

                input.click();
            });

            const image = await uploadImage;
            make = seedImage(image.source, image.width, image.height);
            listenOnce(SLIDE_EVENTS.MOUSEDOWN, make);
        },
        unmount: () => unlisten(SLIDE_EVENTS.MOUSEDOWN, make)
    };
};
