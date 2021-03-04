import { SlideKeyboardEvent, SlideMouseEvent, SlideMouseEventPayload, SLIDE_EVENTS } from '@/events/types';
import { dispatch, listen, listenOnce, unlisten } from '@/events/utilities';
import { AppStore } from '@/store/types';
import V from '@/utilities/Vector';
import { PointerTool } from '.';
import { EditorTool, TOOL_NAMES } from './types';
import { resolvePosition } from './utilities';

export default (store: AppStore): EditorTool => {
    function seedImage(image: string, dimensions: V): (event: SlideMouseEvent) => void {
        return function make(event) {
            const { slide, baseEvent } = event.detail;
            const maker = slide.makeImageInteractive(resolvePosition(baseEvent, slide), image, dimensions);
            slide.broadcastSetGraphic(maker.target);

            // Start tracking the last mouse event so keypress handlers can emulate mouse events
            let lastMouseEvent = event;
            const resizeListener = maker.resizeListener();

            listen(SLIDE_EVENTS.KEYDOWN, keyDownHandler);
            listen(SLIDE_EVENTS.KEYUP, keyUpHandler);
            listen(SLIDE_EVENTS.MOUSEMOVE, update);
            listenOnce(SLIDE_EVENTS.MOUSEUP, complete);

            // When Shift, Ctrl, or Alt are pressed or unpressed, simulate a mousemove event
            // This allows the renderer to immediately adjust the shape dimensions if need be
            function keyDownHandler(event: SlideKeyboardEvent): void {
                const { baseEvent } = event.detail;
                if (!['Control', 'Alt'].includes(baseEvent.key)) {
                    return;
                }

                const mouseEvent = new MouseEvent('mousemeove', {
                    clientX: lastMouseEvent.detail.baseEvent.clientX,
                    clientY: lastMouseEvent.detail.baseEvent.clientY,
                    ctrlKey: baseEvent.key === 'Control' || lastMouseEvent.detail.baseEvent.ctrlKey,
                    altKey: baseEvent.key === 'Alt' || lastMouseEvent.detail.baseEvent.altKey
                });

                dispatch(new CustomEvent<SlideMouseEventPayload>(
                    SLIDE_EVENTS.MOUSEMOVE,
                    {
                        detail: {
                            ...lastMouseEvent.detail,
                            baseEvent: mouseEvent
                        }
                    }
                ));
            }

            function keyUpHandler(event: SlideKeyboardEvent): void {
                const { baseEvent } = event.detail;
                if (!['Control', 'Alt'].includes(baseEvent.key)) {
                    return;
                }

                const mouseEvent = new MouseEvent('mousemeove', {
                    clientX: lastMouseEvent.detail.baseEvent.clientX,
                    clientY: lastMouseEvent.detail.baseEvent.clientY,
                    ctrlKey: baseEvent.key !== 'Control' && lastMouseEvent.detail.baseEvent.ctrlKey,
                    altKey: baseEvent.key !== 'Alt' && lastMouseEvent.detail.baseEvent.altKey
                });

                dispatch(new CustomEvent<SlideMouseEventPayload>(
                    SLIDE_EVENTS.MOUSEMOVE,
                    {
                        detail: {
                            ...lastMouseEvent.detail,
                            baseEvent: mouseEvent
                        }
                    }
                ));
            }

            function update(event: SlideMouseEvent): void {
                resizeListener(event);
                slide.broadcastSetGraphic(maker.target);
                lastMouseEvent = event;
            }

            function complete(): void {
                maker.complete();
                unlisten(SLIDE_EVENTS.MOUSEMOVE, update);
                unlisten(SLIDE_EVENTS.KEYDOWN, keyDownHandler);
                unlisten(SLIDE_EVENTS.KEYUP, keyUpHandler);

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
            listenOnce(SLIDE_EVENTS.MOUSEDOWN, make);
        },
        unmount: () => unlisten(SLIDE_EVENTS.MOUSEDOWN, make)
    };
};
