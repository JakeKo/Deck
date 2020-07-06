import * as SVG from 'svg.js';
import {
    GraphicMouseEventPayload,
    GRAPHIC_EVENTS,
    SlideKeyboardEventPayload,
    SlideMouseEventPayload,
    SLIDE_EVENTS,
    VertexMouseEventPayload,
    VERTEX_EVENTS,
    SlideMouseEvent,
    GraphicMouseEvent,
    SlideKeyboardEvent,
    VertexMouseEvent,
    EVENT_CATEGORIES
} from '../events/types';
import Vector from '../utilities/Vector';
import { CanvasRenderer } from './helpers';
import SlideRenderer from './SlideRenderer';
import { dispatch } from '../events/utilities';

function graphicMouseEvent(name: GRAPHIC_EVENTS, slideRenderer: SlideRenderer, graphicId: string, baseEvent: MouseEvent): GraphicMouseEvent {
    return new CustomEvent<GraphicMouseEventPayload>(name, {
        detail: { slideRenderer, graphicId, baseEvent, category: EVENT_CATEGORIES.GRAPHIC_MOUSE }
    });
}

function slideMouseEvent(name: SLIDE_EVENTS, slideRenderer: SlideRenderer, isElementEvent: boolean, baseEvent: MouseEvent): SlideMouseEvent {
    return new CustomEvent<SlideMouseEventPayload>(name, {
        detail: { slideRenderer, isElementEvent, baseEvent, category: EVENT_CATEGORIES.SLIDE_MOUSE}
    });
}

function slideKeyboardEvent(name: SLIDE_EVENTS, slideRenderer: SlideRenderer, isElementEvent: boolean, baseEvent: KeyboardEvent): SlideKeyboardEvent {
    return new CustomEvent<SlideKeyboardEventPayload>(name, {
        detail: { slideRenderer, isElementEvent, baseEvent, category: EVENT_CATEGORIES.SLIDE_KEYBOARD }
    });
}

function vertexMouseEvent(name: VERTEX_EVENTS, slideRenderer: SlideRenderer, vertexLocation: string, baseEvent: MouseEvent): VertexMouseEvent {
    return new CustomEvent<VertexMouseEventPayload>(name, {
        detail: { slideRenderer, vertexLocation, baseEvent, category: EVENT_CATEGORIES.VERTEX_MOUSE }
    });
}

// TODO: Consider including the rich graphic, not just the ID
// Decorate custom events with more contextual information
// Synthetically propagate events to the slide
export function decorateGraphicEvents(svg: SVG.Element, slideRenderer: SlideRenderer, graphicId: string) {
    svg.node.addEventListener('mouseup', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(graphicMouseEvent(GRAPHIC_EVENTS.MOUSEUP, slideRenderer, graphicId, baseEvent));
        dispatch(slideMouseEvent(SLIDE_EVENTS.MOUSEUP, slideRenderer, true, baseEvent));
    });

    svg.node.addEventListener('mousedown', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(graphicMouseEvent(GRAPHIC_EVENTS.MOUSEDOWN, slideRenderer, graphicId, baseEvent));
        dispatch(slideMouseEvent(SLIDE_EVENTS.MOUSEDOWN, slideRenderer, true, baseEvent));
    });

    svg.node.addEventListener('mouseover', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(graphicMouseEvent(GRAPHIC_EVENTS.MOUSEOVER, slideRenderer, graphicId, baseEvent));
        dispatch(slideMouseEvent(SLIDE_EVENTS.MOUSEOVER, slideRenderer, true, baseEvent));
    });

    svg.node.addEventListener('mouseout', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(graphicMouseEvent(GRAPHIC_EVENTS.MOUSEOUT, slideRenderer, graphicId, baseEvent));
        dispatch(slideMouseEvent(SLIDE_EVENTS.MOUSEOUT, slideRenderer, true, baseEvent));
    });

    svg.node.addEventListener('mousemove', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(graphicMouseEvent(GRAPHIC_EVENTS.MOUSEMOVE, slideRenderer, graphicId, baseEvent));
        dispatch(slideMouseEvent(SLIDE_EVENTS.MOUSEMOVE, slideRenderer, true, baseEvent));
    });
}

export function decorateSlideEvents(slideRenderer: SlideRenderer): void {
    slideRenderer.canvas.node.addEventListener('mouseup', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(slideMouseEvent(SLIDE_EVENTS.MOUSEUP, slideRenderer, false, baseEvent));
    });

    slideRenderer.canvas.node.addEventListener('mousedown', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(slideMouseEvent(SLIDE_EVENTS.MOUSEDOWN, slideRenderer, false, baseEvent));
    });

    slideRenderer.canvas.node.addEventListener('mouseover', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(slideMouseEvent(SLIDE_EVENTS.MOUSEOVER, slideRenderer, false, baseEvent));
    });

    slideRenderer.canvas.node.addEventListener('mouseout', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(slideMouseEvent(SLIDE_EVENTS.MOUSEOUT, slideRenderer, false, baseEvent));
    });

    slideRenderer.canvas.node.addEventListener('mousemove', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(slideMouseEvent(SLIDE_EVENTS.MOUSEMOVE, slideRenderer, false, baseEvent));
    });

    slideRenderer.canvas.node.addEventListener('keyup', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(slideKeyboardEvent(SLIDE_EVENTS.KEYUP, slideRenderer, false, baseEvent));
    });

    slideRenderer.canvas.node.addEventListener('keydown', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(slideKeyboardEvent(SLIDE_EVENTS.KEYDOWN, slideRenderer, false, baseEvent));
    });
}

export function decorateVertexEvents(svg: SVG.Element, slideRenderer: SlideRenderer, vertexLocation: string): void {
    svg.node.addEventListener('mouseup', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(vertexMouseEvent(VERTEX_EVENTS.MOUSEUP, slideRenderer, vertexLocation, baseEvent));
        dispatch(slideMouseEvent(SLIDE_EVENTS.MOUSEUP, slideRenderer, true, baseEvent));
    });

    svg.node.addEventListener('mousedown', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(vertexMouseEvent(VERTEX_EVENTS.MOUSEDOWN, slideRenderer, vertexLocation, baseEvent));
        dispatch(slideMouseEvent(SLIDE_EVENTS.MOUSEDOWN, slideRenderer, true, baseEvent));
    });

    svg.node.addEventListener('mouseover', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(vertexMouseEvent(VERTEX_EVENTS.MOUSEOVER, slideRenderer, vertexLocation, baseEvent));
        dispatch(slideMouseEvent(SLIDE_EVENTS.MOUSEOVER, slideRenderer, true, baseEvent));
    });

    svg.node.addEventListener('mouseout', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(vertexMouseEvent(VERTEX_EVENTS.MOUSEOUT, slideRenderer, vertexLocation, baseEvent));
        dispatch(slideMouseEvent(SLIDE_EVENTS.MOUSEOUT, slideRenderer, true, baseEvent));
    });

    svg.node.addEventListener('mousemove', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(vertexMouseEvent(VERTEX_EVENTS.MOUSEMOVE, slideRenderer, vertexLocation, baseEvent));
        dispatch(slideMouseEvent(SLIDE_EVENTS.MOUSEMOVE, slideRenderer, true, baseEvent));
    });
}

export function renderBackdrop(slideRenderer: SlideRenderer, width: number, height: number): void {
    new CanvasRenderer({
        canvas: slideRenderer.canvas,
        origin: Vector.zero,
        width,
        height
    }).render();
}
