import { DECK_EVENTS } from './types';

type DeckEventHandler = (event: CustomEvent) => void;

const events = {} as { [key in DECK_EVENTS]: { [key: string]: DeckEventHandler } };

function listen(eventId: DECK_EVENTS, handlerId: string, handler: DeckEventHandler): void {
    if (isListening(eventId, handlerId)) {
        console.warn(`Overshadowing handler (${handlerId}) which was not explicitly unlistened`);
    }

    events[eventId][handlerId] = handler;
    document.addEventListener(eventId, handler as EventListener);
}

function listenOnce(eventId: DECK_EVENTS, handlerId: string, handler: DeckEventHandler): void {
    if (isListening(eventId, handlerId)) {
        console.warn(`Overshadowing handler (${handlerId}) which was not explicitly unlistened`);
    }

    listen(eventId, handlerId, ((event: CustomEvent) => {
        handler(event);
        unlisten(eventId, handlerId);
    }) as EventListener);
}

function unlisten(eventId: DECK_EVENTS, handlerId: string): void {
    if (!isListening(eventId, handlerId)) {
        console.warn(`Unlistening handler (${handlerId}) which was not explicitly listened`);
    } else {
        document.removeEventListener(eventId, events[eventId][handlerId] as EventListener);
        delete events[eventId][handlerId];
        !isHeard(eventId) && delete events[eventId];
    }
}

function unlistenAll(eventId: DECK_EVENTS): void {
    isHeard(eventId) && Object.keys(events[eventId]).forEach(handlerId => unlisten(eventId, handlerId));
}

function unlistenEverywhere(handlerId: string): void {
    Object.keys(events).forEach(eventId => unlisten(eventId as DECK_EVENTS, handlerId));
}

function isListening(eventId: DECK_EVENTS, handlerId: string): boolean {
    return events[eventId] && events[eventId][handlerId] !== undefined;
}

function isListeningAnywhere(handlerId: string): boolean {
    return Object.values(events).some(event => event[handlerId] !== undefined);
}

function isHeard(eventId: DECK_EVENTS): boolean {
    return events[eventId] !== undefined && Object.keys(events[eventId]).length > 0;
}
