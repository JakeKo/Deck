import { listen, listenOnce, unlisten } from '@/events';
import { SlideKeyboardEvent, SlideMouseEvent, SLIDE_EVENTS } from '@/events/types';
import { GRAPHIC_TYPES, IImageMaker } from '@/rendering/types';
import { AppStore } from '@/store/types';
import { provideId } from '@/utilities/IdProvider';
import V from '@/utilities/Vector';
import { PointerTool } from '.';
import { EditorTool, TOOL_NAMES } from './types';
import { mouseEventFromKeyDownEvent, mouseEventFromKeyUpEvent, resolvePosition } from './utilities';

export default (store: AppStore): EditorTool => {
    function seedImage(image: string, dimensions: V): (event: SlideMouseEvent) => void {
        return function make(event) {
            const { slide, baseEvent } = event.detail;
            const graphicId = provideId();
            const maker = slide.initInteractiveCreate(graphicId, GRAPHIC_TYPES.IMAGE) as IImageMaker;
            slide.createGraphic(maker.create({ source: image, dimensions }));

            let lastMouseEvent = event;
            const resizeHandler = maker.initResize(resolvePosition(baseEvent, slide));

            listen(SLIDE_EVENTS.KEYDOWN, 'image--key-down-handler', keyDownHandler);
            listen(SLIDE_EVENTS.KEYUP, 'image--key-up-handler', keyUpHandler);
            listen(SLIDE_EVENTS.MOUSEMOVE, 'image--update', update);
            listenOnce(SLIDE_EVENTS.MOUSEUP, 'image--complete', complete);

            function keyDownHandler(event: SlideKeyboardEvent): void {
                mouseEventFromKeyDownEvent(event, lastMouseEvent);
            }

            function keyUpHandler(event: SlideKeyboardEvent): void {
                mouseEventFromKeyUpEvent(event, lastMouseEvent);
            }

            function update(event: SlideMouseEvent): void {
                const deltas = resizeHandler(event);
                slide.setProps(graphicId, GRAPHIC_TYPES.IMAGE, deltas);
                lastMouseEvent = event;
            }

            function complete(event: SlideMouseEvent): void {
                update(event);
                maker.endResize();

                unlisten(SLIDE_EVENTS.MOUSEMOVE, 'image--update');
                unlisten(SLIDE_EVENTS.KEYDOWN, 'image--key-down-handler');
                unlisten(SLIDE_EVENTS.KEYUP, 'image--key-up-handler');

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
            make = seedImage(image.source, new V(image.width, image.height));
            listenOnce(SLIDE_EVENTS.MOUSEDOWN, 'make', make);
        },
        unmount: () => unlisten(SLIDE_EVENTS.MOUSEDOWN, 'make')
    };
};
