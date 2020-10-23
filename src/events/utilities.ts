import { IGraphicRenderer, IHelperRenderer, ISlideRenderer } from '@/rendering/types';
import { DECK_EVENTS, SlideMouseEvent, SlideMouseEventPayload, SLIDE_EVENTS } from './types';

export function listen(eventName: DECK_EVENTS | string, handler: (event: CustomEvent) => void): void {
    document.addEventListener(eventName, handler as EventListener);
}

export function listenOnce(eventName: DECK_EVENTS | string, handler: (event: CustomEvent) => void): void {
    document.addEventListener(eventName, handler as EventListener, { once: true });
}

export function unlisten(eventName: DECK_EVENTS | string, handler: (event: CustomEvent) => void): void {
    document.removeEventListener(eventName, handler as EventListener);
}

export function dispatch(event: CustomEvent): void {
    document.dispatchEvent(event);
}

export function makeSlideMouseEvent(name: SLIDE_EVENTS, slide: ISlideRenderer, target: IGraphicRenderer | IHelperRenderer | undefined, baseEvent: MouseEvent): SlideMouseEvent {
    return new CustomEvent<SlideMouseEventPayload>(name, { detail: { type: name, slide, target, baseEvent } });
}
