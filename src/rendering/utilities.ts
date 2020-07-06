import * as SVG from 'svg.js';
import {
    EVENT_CATEGORIES,
    GraphicMouseEvent,
    GraphicMouseEventPayload,
    GRAPHIC_EVENTS,
    SlideKeyboardEvent,
    SlideKeyboardEventPayload,
    SlideMouseEvent,
    SlideMouseEventPayload,
    SLIDE_EVENTS,
    VertexMouseEvent,
    VertexMouseEventPayload,
    VERTEX_EVENTS
} from '../events/types';
import { dispatch } from '../events/utilities';
import Vector from '../utilities/Vector';
import { CanvasRenderer } from './helpers';
import SlideRenderer from './SlideRenderer';
import { GraphicRenderer } from './types';

function graphicMouseEvent(name: GRAPHIC_EVENTS, slideRenderer: SlideRenderer, graphic: GraphicRenderer, baseEvent: MouseEvent): GraphicMouseEvent {
    return new CustomEvent<GraphicMouseEventPayload>(name, {
        detail: { slideRenderer, graphic, baseEvent, category: EVENT_CATEGORIES.GRAPHIC_MOUSE }
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

// Decorate custom events with more contextual information
// Synthetically propagate events to the slide
export function decorateGraphicEvents(svg: SVG.Element, slideRenderer: SlideRenderer, graphic: GraphicRenderer) {
    svg.node.addEventListener('mouseup', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(graphicMouseEvent(GRAPHIC_EVENTS.MOUSEUP, slideRenderer, graphic, baseEvent));
        dispatch(slideMouseEvent(SLIDE_EVENTS.MOUSEUP, slideRenderer, true, baseEvent));
    });

    svg.node.addEventListener('mousedown', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(graphicMouseEvent(GRAPHIC_EVENTS.MOUSEDOWN, slideRenderer, graphic, baseEvent));
        dispatch(slideMouseEvent(SLIDE_EVENTS.MOUSEDOWN, slideRenderer, true, baseEvent));
    });

    svg.node.addEventListener('mouseover', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(graphicMouseEvent(GRAPHIC_EVENTS.MOUSEOVER, slideRenderer, graphic, baseEvent));
        dispatch(slideMouseEvent(SLIDE_EVENTS.MOUSEOVER, slideRenderer, true, baseEvent));
    });

    svg.node.addEventListener('mouseout', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(graphicMouseEvent(GRAPHIC_EVENTS.MOUSEOUT, slideRenderer, graphic, baseEvent));
        dispatch(slideMouseEvent(SLIDE_EVENTS.MOUSEOUT, slideRenderer, true, baseEvent));
    });

    svg.node.addEventListener('mousemove', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(graphicMouseEvent(GRAPHIC_EVENTS.MOUSEMOVE, slideRenderer, graphic, baseEvent));
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
