import { SLIDE_EVENTS, GRAPHIC_EVENTS } from "./constants";

export function listen(eventName: SLIDE_EVENTS | GRAPHIC_EVENTS, handler: (event: CustomEvent) => void): void {
    document.addEventListener(eventName, handler as EventListener);
}

export function unlisten(eventName: SLIDE_EVENTS | GRAPHIC_EVENTS, handler: (event: CustomEvent) => void): void {
    document.removeEventListener(eventName, handler as EventListener);
}
