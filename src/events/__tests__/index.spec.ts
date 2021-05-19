import { dispatch, listen, listenOnce, unlisten } from "../";
import { SlideZoomEventPayload, SLIDE_EVENTS } from "../types";

function makeHandlerId() {
    return Math.random().toString();
}

describe('events', () => {
    describe('listen', () => {
        it('registers a listener on the specified event', async () => {
            // Arrange
            const handler = jest.fn();
            
            // Act
            listen(SLIDE_EVENTS.ZOOM, makeHandlerId(), handler);
            dispatch<SlideZoomEventPayload>(SLIDE_EVENTS.ZOOM, { zoom: 5 });
            dispatch<SlideZoomEventPayload>(SLIDE_EVENTS.ZOOM, { zoom: 5 });

            // Assert
            expect(handler).toBeCalledTimes(2);
        });
    });

    describe('listenOnce', () => {
        it('registers a listener on the specified event once', async () => {
            // Arrange
            const handler = jest.fn();
            
            // Act
            listenOnce(SLIDE_EVENTS.ZOOM, makeHandlerId(), handler);
            dispatch<SlideZoomEventPayload>(SLIDE_EVENTS.ZOOM, { zoom: 5 });
            dispatch<SlideZoomEventPayload>(SLIDE_EVENTS.ZOOM, { zoom: 5 });

            // Assert
            expect(handler).toBeCalledTimes(1);
        });
    });

    describe('unlisten', () => {
        it('removes a listener from the specified event', async () => {
            // Arrange
            const handler = jest.fn();
            const handlerId = makeHandlerId();
            
            // Act
            listen(SLIDE_EVENTS.ZOOM, handlerId, handler);
            dispatch<SlideZoomEventPayload>(SLIDE_EVENTS.ZOOM, { zoom: 5 });
            unlisten(SLIDE_EVENTS.ZOOM, handlerId);
            dispatch<SlideZoomEventPayload>(SLIDE_EVENTS.ZOOM, { zoom: 5 });

            // Assert
            expect(handler).toBeCalledTimes(1);
        });
    });
});
