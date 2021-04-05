import { listen } from '@/events';
import { GraphicUpdated, GRAPHIC_EVENT_CODES } from '@/events/types';
import { AppStore } from './types';

function initStoreEventBus(store: AppStore): void {
    listen(GRAPHIC_EVENT_CODES.UPDATED, 'store-event-bus-graphic-updated-listener', (event: GraphicUpdated): void => {
        const { publisherId, slideId, graphicId, graphicType, props } = event.detail;
        if (publisherId === store.state.eventPublisherId) {
            return;
        }

        store.mutations.setProps(slideId, graphicId, graphicType, props, false);
    });
}

export default initStoreEventBus;
