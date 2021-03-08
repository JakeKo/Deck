import { DeckCustomEventPayload, DECK_EVENTS } from './types';

type DeckCustomEventHandler = (event: CustomEvent) => void;

const events = {} as { [key in DECK_EVENTS]: { [key: string]: DeckCustomEventHandler } };

/**
 * Creates a listener for the provided event.
 */
function listen(eventId: DECK_EVENTS, handlerId: string, handler: DeckCustomEventHandler): string {
    // Check if a handler with the given ID is already listening to the specified event
    // If there is, the old handler will be overshadowed and it won't be possible to unlisten
    if (isListening(eventId, handlerId)) {
        console.warn(`Overshadowing handler (${handlerId}) which was not explicitly unlistened`);
    }

    if (!isHeard(eventId)) {
        events[eventId] = {};
    }

    events[eventId][handlerId] = handler;
    document.addEventListener(eventId, handler as EventListener);

    return handlerId;
}

/**
 * Creates a listener for the provided event which will only handle one occurrence of the event.
 */
function listenOnce(eventId: DECK_EVENTS, handlerId: string, handler: DeckCustomEventHandler): string {
    // Check if a handler with the given ID is already listening to the specified event
    // If there is, the old handler will be overshadowed and it won't be possible to unlisten
    if (isListening(eventId, handlerId)) {
        console.warn(`Overshadowing handler (${handlerId}) which was not explicitly unlistened`);
    }

    listen(eventId, handlerId, ((event: CustomEvent) => {
        handler(event);
        unlisten(eventId, handlerId);
    }) as EventListener);

    return handlerId;
}

/**
 * Removes a listener with the given ID from the event with the given ID.
 */
function unlisten(eventId: DECK_EVENTS, handlerId: string): void {
    if (!isListening(eventId, handlerId)) {
        console.warn(`Unlistening handler (${handlerId}) which was not explicitly listened`);
        return;
    }

    // Remove the actual event listener from the document and delete the properties on the events object
    document.removeEventListener(eventId, events[eventId][handlerId] as EventListener);
    delete events[eventId][handlerId];
    !isHeard(eventId) && delete events[eventId];
}

/**
 * Determines if a listener with the given ID is listening to an event with the given ID.
 */
function isListening(eventId: DECK_EVENTS, handlerId: string): boolean {
    return events[eventId] && events[eventId][handlerId] !== undefined;
}

/**
 * Determines if an event with the given ID is being listened to by any listeners.
 */
function isHeard(eventId: DECK_EVENTS): boolean {
    return events[eventId] !== undefined && Object.keys(events[eventId]).length > 0;
}

/**
 * Dispatches a custom Deck event with the given ID and payload.
 */
function dispatch<T extends DeckCustomEventPayload>(eventId: DECK_EVENTS, payload: T): void {
    document.dispatchEvent(new CustomEvent<DeckCustomEventPayload>(eventId, { detail: payload }));
}

export {
    listen,
    listenOnce,
    unlisten,
    dispatch
};
