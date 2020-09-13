import { SlideMouseEvent, SLIDE_EVENTS } from '@/events/types';
import { listen, listenOnce, unlisten } from '@/events/utilities';
import { AppStore } from '@/store/types';
import Vector from '@/utilities/Vector';
import { PointerTool } from '.';
import { EditorTool, TOOL_NAMES } from './types';
import { resolvePosition } from './utilities';

export default (store: AppStore): EditorTool => {
    function seedImage(image: string, dimensions: Vector): (event: SlideMouseEvent) => void {
        return function make(event) {
            const { slide, baseEvent } = event.detail;
            const maker = slide.makeImageInteractive(resolvePosition(baseEvent, slide), image, dimensions);
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
            make = seedImage(image.source, new Vector(image.width, image.height));
            listenOnce(SLIDE_EVENTS.MOUSEDOWN, make);
        },
        unmount: () => unlisten(SLIDE_EVENTS.MOUSEDOWN, make)
    };
};
