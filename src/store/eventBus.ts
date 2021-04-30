import { listen } from '@/events';
import { GraphicCreated, GraphicFocused, GraphicUnfocused, GraphicUpdated, GRAPHIC_EVENT_CODES } from '@/events/types';
import { AppStore } from './types';

function eventIsRelevant(store: AppStore, { publisherId }: { publisherId: string }): boolean {
    return publisherId !== store.state.eventPublisherId;
}

function initStoreEventBus(store: AppStore): void {
    listen(GRAPHIC_EVENT_CODES.CREATED, 'store-event-bus-graphic-created-listener', (event: GraphicCreated): void => {
        if (!eventIsRelevant(store, event.detail)) {
            return;
        }

        const { slideId, props } = event.detail;
        store.mutations.createGraphic(slideId, props, false);
    });

    listen(GRAPHIC_EVENT_CODES.UPDATED, 'store-event-bus-graphic-updated-listener', (event: GraphicUpdated): void => {
        if (!eventIsRelevant(store, event.detail)) {
            return;
        }

        const { slideId, graphicId, graphicType, props } = event.detail;
        store.mutations.setProps(slideId, graphicId, graphicType, props, false);
    });

    listen(GRAPHIC_EVENT_CODES.FOCUSED, 'store-event-bus-graphic-focused-listener', (event: GraphicFocused): void => {
        if (!eventIsRelevant(store, event.detail)) {
            return;
        }

        const { slideId, graphicId } = event.detail;
        store.mutations.focusGraphic(slideId, graphicId, false);
    });

    listen(GRAPHIC_EVENT_CODES.UNFOCUSED, 'store-event-bus-graphic-unfocused-listener', (event: GraphicUnfocused): void => {
        if (!eventIsRelevant(store, event.detail)) {
            return;
        }

        const { slideId, graphicId } = event.detail;
        store.mutations.unfocusGraphic(slideId, graphicId, false);
    });
}

export default initStoreEventBus;
