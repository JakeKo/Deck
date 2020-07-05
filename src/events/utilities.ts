import { SLIDE_EVENTS, GRAPHIC_EVENTS } from "./types";

export function listen(eventName: SLIDE_EVENTS | GRAPHIC_EVENTS, handler: (event: CustomEvent) => void): void {
    document.addEventListener(eventName, handler as EventListener);
}

export function unlisten(eventName: SLIDE_EVENTS | GRAPHIC_EVENTS, handler: (event: CustomEvent) => void): void {
    document.removeEventListener(eventName, handler as EventListener);
}

export function dispatch(event: CustomEvent): void {
    document.dispatchEvent(event);
}
