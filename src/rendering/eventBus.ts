import { listen } from '@/events';
import { GraphicUpdated, GRAPHIC_EVENT_CODES } from '@/events/types';
import { ISlideRenderer } from './types';

function initRendererEventBus(renderer: ISlideRenderer): void {
    listen(GRAPHIC_EVENT_CODES.UPDATED, `renderer-${renderer.slideId}-event-bus-graphic-updated-listener`, (event: GraphicUpdated): void => {
        const { publisherId, slideId, graphicId, graphicType, props } = event.detail;
        if (publisherId === renderer.eventPublisherId || slideId !== renderer.slideId) {
            return;
        }

        console.log(JSON.stringify(props));
        renderer.setProps(graphicId, graphicType, props, false);
    });
}

export default initRendererEventBus;
