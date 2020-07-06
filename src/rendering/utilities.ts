import * as SVG from 'svg.js';
import {
    CurveMouseEvent,
    CurveMouseEventPayload,
    CURVE_EVENTS,
    RectangleMouseEvent,
    RectangleMouseEventPayload,
    RECTANGLE_EVENTS,
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
import { CurveRenderer, RectangleRenderer } from './graphics';
import { CanvasRenderer } from './helpers';
import SlideRenderer from './SlideRenderer';
import { GraphicRenderer } from './types';

function rectangleMouseEvent(name: RECTANGLE_EVENTS, slide: SlideRenderer, target: RectangleRenderer, baseEvent: MouseEvent): RectangleMouseEvent {
    return new CustomEvent<RectangleMouseEventPayload>(name, { detail: { type: name, slide, target, baseEvent } });
}

function curveMouseEvent(name: CURVE_EVENTS, slide: SlideRenderer, target: CurveRenderer, baseEvent: MouseEvent): CurveMouseEvent {
    return new CustomEvent<CurveMouseEventPayload>(name, { detail: { type: name, slide, target, baseEvent } });
}

function slideMouseEvent(name: SLIDE_EVENTS, slide: SlideRenderer, target: GraphicRenderer | undefined, baseEvent: MouseEvent): SlideMouseEvent {
    return new CustomEvent<SlideMouseEventPayload>(name, { detail: { type: name, slide, target, baseEvent } });
}

function slideKeyboardEvent(name: SLIDE_EVENTS, slide: SlideRenderer, target: GraphicRenderer | undefined, baseEvent: KeyboardEvent): SlideKeyboardEvent {
    return new CustomEvent<SlideKeyboardEventPayload>(name, { detail: { type: name, slide, target, baseEvent } });
}

function vertexMouseEvent(name: VERTEX_EVENTS, slide: SlideRenderer, location: string, baseEvent: MouseEvent): VertexMouseEvent {
    return new CustomEvent<VertexMouseEventPayload>(name, { detail: { type: name, slide, location, baseEvent } });
}

// Decorate custom events with more contextual information
// Synthetically propagate events to the slide
export function decorateRectangleEvents(svg: SVG.Element, slide: SlideRenderer, graphic: RectangleRenderer) {
    svg.node.addEventListener('mouseup', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(rectangleMouseEvent(RECTANGLE_EVENTS.MOUSEUP, slide, graphic, baseEvent));
        dispatch(slideMouseEvent(SLIDE_EVENTS.MOUSEUP, slide, graphic, baseEvent));
    });

    svg.node.addEventListener('mousedown', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(rectangleMouseEvent(RECTANGLE_EVENTS.MOUSEDOWN, slide, graphic, baseEvent));
        dispatch(slideMouseEvent(SLIDE_EVENTS.MOUSEDOWN, slide, graphic, baseEvent));
    });

    svg.node.addEventListener('mouseover', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(rectangleMouseEvent(RECTANGLE_EVENTS.MOUSEOVER, slide, graphic, baseEvent));
        dispatch(slideMouseEvent(SLIDE_EVENTS.MOUSEOVER, slide, graphic, baseEvent));
    });

    svg.node.addEventListener('mouseout', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(rectangleMouseEvent(RECTANGLE_EVENTS.MOUSEOUT, slide, graphic, baseEvent));
        dispatch(slideMouseEvent(SLIDE_EVENTS.MOUSEOUT, slide, graphic, baseEvent));
    });

    svg.node.addEventListener('mousemove', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(rectangleMouseEvent(RECTANGLE_EVENTS.MOUSEMOVE, slide, graphic, baseEvent));
        dispatch(slideMouseEvent(SLIDE_EVENTS.MOUSEMOVE, slide, graphic, baseEvent));
    });
}

export function decorateCurveEvents(svg: SVG.Element, slide: SlideRenderer, graphic: CurveRenderer) {
    svg.node.addEventListener('mouseup', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(curveMouseEvent(CURVE_EVENTS.MOUSEUP, slide, graphic, baseEvent));
        dispatch(slideMouseEvent(SLIDE_EVENTS.MOUSEUP, slide, graphic, baseEvent));
    });

    svg.node.addEventListener('mousedown', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(curveMouseEvent(CURVE_EVENTS.MOUSEDOWN, slide, graphic, baseEvent));
        dispatch(slideMouseEvent(SLIDE_EVENTS.MOUSEDOWN, slide, graphic, baseEvent));
    });

    svg.node.addEventListener('mouseover', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(curveMouseEvent(CURVE_EVENTS.MOUSEOVER, slide, graphic, baseEvent));
        dispatch(slideMouseEvent(SLIDE_EVENTS.MOUSEOVER, slide, graphic, baseEvent));
    });

    svg.node.addEventListener('mouseout', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(curveMouseEvent(CURVE_EVENTS.MOUSEOUT, slide, graphic, baseEvent));
        dispatch(slideMouseEvent(SLIDE_EVENTS.MOUSEOUT, slide, graphic, baseEvent));
    });

    svg.node.addEventListener('mousemove', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(curveMouseEvent(CURVE_EVENTS.MOUSEMOVE, slide, graphic, baseEvent));
        dispatch(slideMouseEvent(SLIDE_EVENTS.MOUSEMOVE, slide, graphic, baseEvent));
    });
}

export function decorateSlideEvents(slideRenderer: SlideRenderer): void {
    slideRenderer.canvas.node.addEventListener('mouseup', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(slideMouseEvent(SLIDE_EVENTS.MOUSEUP, slideRenderer, undefined, baseEvent));
    });

    slideRenderer.canvas.node.addEventListener('mousedown', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(slideMouseEvent(SLIDE_EVENTS.MOUSEDOWN, slideRenderer, undefined, baseEvent));
    });

    slideRenderer.canvas.node.addEventListener('mouseover', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(slideMouseEvent(SLIDE_EVENTS.MOUSEOVER, slideRenderer, undefined, baseEvent));
    });

    slideRenderer.canvas.node.addEventListener('mouseout', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(slideMouseEvent(SLIDE_EVENTS.MOUSEOUT, slideRenderer, undefined, baseEvent));
    });

    slideRenderer.canvas.node.addEventListener('mousemove', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(slideMouseEvent(SLIDE_EVENTS.MOUSEMOVE, slideRenderer, undefined, baseEvent));
    });

    slideRenderer.canvas.node.addEventListener('keyup', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(slideKeyboardEvent(SLIDE_EVENTS.KEYUP, slideRenderer, undefined, baseEvent));
    });

    slideRenderer.canvas.node.addEventListener('keydown', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(slideKeyboardEvent(SLIDE_EVENTS.KEYDOWN, slideRenderer, undefined, baseEvent));
    });
}

export function decorateVertexEvents(svg: SVG.Element, slide: SlideRenderer, location: string): void {
    svg.node.addEventListener('mouseup', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(vertexMouseEvent(VERTEX_EVENTS.MOUSEUP, slide, location, baseEvent));
        dispatch(slideMouseEvent(SLIDE_EVENTS.MOUSEUP, slide, undefined, baseEvent));
    });

    svg.node.addEventListener('mousedown', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(vertexMouseEvent(VERTEX_EVENTS.MOUSEDOWN, slide, location, baseEvent));
        dispatch(slideMouseEvent(SLIDE_EVENTS.MOUSEDOWN, slide, undefined, baseEvent));
    });

    svg.node.addEventListener('mouseover', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(vertexMouseEvent(VERTEX_EVENTS.MOUSEOVER, slide, location, baseEvent));
        dispatch(slideMouseEvent(SLIDE_EVENTS.MOUSEOVER, slide, undefined, baseEvent));
    });

    svg.node.addEventListener('mouseout', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(vertexMouseEvent(VERTEX_EVENTS.MOUSEOUT, slide, location, baseEvent));
        dispatch(slideMouseEvent(SLIDE_EVENTS.MOUSEOUT, slide, undefined, baseEvent));
    });

    svg.node.addEventListener('mousemove', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(vertexMouseEvent(VERTEX_EVENTS.MOUSEMOVE, slide, location, baseEvent));
        dispatch(slideMouseEvent(SLIDE_EVENTS.MOUSEMOVE, slide, undefined, baseEvent));
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
