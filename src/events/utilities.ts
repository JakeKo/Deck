import { DECK_EVENTS } from "./types";

export function listen(eventName: DECK_EVENTS, handler: (event: CustomEvent) => void): void {
    document.addEventListener(eventName, handler as EventListener);
}

export function listenOnce(eventName: DECK_EVENTS, handler: (event: CustomEvent) => void): void {
    document.addEventListener(eventName, handler as EventListener, { once: true });
}

export function unlisten(eventName: DECK_EVENTS, handler: (event: CustomEvent) => void): void {
    document.removeEventListener(eventName, handler as EventListener);
}

export function dispatch(event: CustomEvent): void {
    document.dispatchEvent(event);
}
