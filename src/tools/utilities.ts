import { dispatch } from '@/events';
import { SlideKeyboardEvent, SlideMouseEvent, SlideMouseEventPayload, SLIDE_EVENTS, VertexMouseEvent } from '@/events/types';
import { ISlideRenderer } from '@/rendering/types';
import V from '@/utilities/Vector';

export function resolvePosition(event: MouseEvent, slide: ISlideRenderer): V {
    return new V(event.pageX, event.pageY)
        .scale(1 / slide.zoom)
        .add(slide.bounds.origin.scale(-1))
        .add(new V(slide.rawViewbox.x, slide.rawViewbox.y))
        .apply(Math.round);
}

/**
 * Given a keydown event and the last recorded mouse event, simulate another mouse event with the keypresses in the keydown event.
 * This function is used to immediately update a renderer if shift, ctrl, or alt are pressed.
 */
export function mouseEventFromKeyDownEvent(keyboardEvent: SlideKeyboardEvent, lastMouseEvent: SlideMouseEvent | VertexMouseEvent): void {
    const { baseEvent } = keyboardEvent.detail;
    if (!['Shift', 'Control', 'Alt'].includes(baseEvent.key)) {
        return;
    }

    const mouseEvent = new MouseEvent('mousemeove', {
        clientX: lastMouseEvent.detail.baseEvent.clientX,
        clientY: lastMouseEvent.detail.baseEvent.clientY,
        shiftKey: baseEvent.key === 'Shift' || lastMouseEvent.detail.baseEvent.shiftKey,
        ctrlKey: baseEvent.key === 'Control' || lastMouseEvent.detail.baseEvent.ctrlKey,
        altKey: baseEvent.key === 'Alt' || lastMouseEvent.detail.baseEvent.altKey
    });

    dispatch<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEMOVE, {
        type: SLIDE_EVENTS.MOUSEMOVE,
        slide: lastMouseEvent.detail.slide,
        baseEvent: mouseEvent,
        target: undefined
    });
}

/**
 * Given a keyup event and the last recorded mouse event, simulate another mouse event with the keypresses in the keyup event.
 * This function is used to immediately update a renderer if shift, ctrl, or alt are release.
 */
export function mouseEventFromKeyUpEvent(keyboardEvent: SlideKeyboardEvent, lastMouseEvent: SlideMouseEvent | VertexMouseEvent): void {
    const { baseEvent } = keyboardEvent.detail;
    if (!['Shift', 'Control', 'Alt'].includes(baseEvent.key)) {
        return;
    }

    const mouseEvent = new MouseEvent('mousemeove', {
        clientX: lastMouseEvent.detail.baseEvent.clientX,
        clientY: lastMouseEvent.detail.baseEvent.clientY,
        shiftKey: baseEvent.key !== 'Shift' && lastMouseEvent.detail.baseEvent.shiftKey,
        ctrlKey: baseEvent.key !== 'Control' && lastMouseEvent.detail.baseEvent.ctrlKey,
        altKey: baseEvent.key !== 'Alt' && lastMouseEvent.detail.baseEvent.altKey
    });

    dispatch<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEMOVE, {
        type: SLIDE_EVENTS.MOUSEMOVE,
        slide: lastMouseEvent.detail.slide,
        baseEvent: mouseEvent,
        target: undefined
    });
}
