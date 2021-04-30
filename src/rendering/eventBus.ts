import { listen } from '@/events';
import { GraphicCreated, GraphicFocused, GraphicUnfocused, GraphicUpdated, GRAPHIC_EVENT_CODES } from '@/events/types';
import { ISlideRenderer } from './types';

function eventIsRelevant(renderer: ISlideRenderer, { publisherId, slideId }: { publisherId: string; slideId: string }): boolean {
    return publisherId !== renderer.eventPublisherId && slideId === renderer.slideId;
}

function initRendererEventBus(renderer: ISlideRenderer): void {
    listen(GRAPHIC_EVENT_CODES.CREATED, `renderer-${renderer.slideId}-event-bus-graphic-created-listener`, (event: GraphicCreated): void => {
        if (!eventIsRelevant(renderer, event.detail)) {
            return;
        }

        renderer.createGraphic(event.detail.props, true, false);
    });

    listen(GRAPHIC_EVENT_CODES.UPDATED, `renderer-${renderer.slideId}-event-bus-graphic-updated-listener`, (event: GraphicUpdated): void => {
        if (!eventIsRelevant(renderer, event.detail)) {
            return;
        }

        const { graphicId, graphicType, props } = event.detail;
        renderer.setProps(graphicId, graphicType, props, false);
    });

    listen(GRAPHIC_EVENT_CODES.FOCUSED, `renderer-${renderer.slideId}-event-bus-graphic-focused-listener`, (event: GraphicFocused): void => {
        if (!eventIsRelevant(renderer, event.detail)) {
            return;
        }

        renderer.focusGraphic(event.detail.graphicId, false);
    });

    listen(GRAPHIC_EVENT_CODES.UNFOCUSED, `renderer-${renderer.slideId}-event-bus-graphic-unfocused-listener`, (event: GraphicUnfocused): void => {
        if (!eventIsRelevant(renderer, event.detail)) {
            return;
        }

        renderer.unfocusGraphic(event.detail.graphicId, false);
    });
}

export default initRendererEventBus;
