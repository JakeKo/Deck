import { SlideKeyboardEvent, SlideMouseEvent, SlideMouseEventPayload, SLIDE_EVENTS } from '@/events/types';
import { dispatch, listen, listenOnce, unlisten } from '@/events/utilities';
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
