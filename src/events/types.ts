import { CurveRenderer, RectangleRenderer } from "../rendering/graphics";
import EllipseRenderer from "../rendering/graphics/EllipseRenderer";
import SlideRenderer from "../rendering/SlideRenderer";
import { GraphicRenderer } from "../rendering/types";
import ImageRenderer from "../rendering/graphics/ImageRenderer";

export type DECK_EVENTS = SLIDE_EVENTS | RECTANGLE_EVENTS | CURVE_EVENTS | VERTEX_EVENTS;

// SLIDE EVENTS
export enum SLIDE_EVENTS {
    MOUSEUP = 'deck-slide-mouseup',
    MOUSEDOWN = 'deck-slide-mousedown',
    MOUSEOVER = 'deck-slide-mouseover',
    MOUSEOUT = 'deck-slide-mouseout',
    MOUSEMOVE = 'deck-slide-mousemove',
    KEYDOWN = 'deck-slide-keydown',
    KEYUP = 'deck-slide-keyup'
}

export type SlideMouseEvent = CustomEvent<SlideMouseEventPayload>;
export type SlideMouseEventPayload = {
    baseEvent: MouseEvent;
    slide: SlideRenderer;
    type: SLIDE_EVENTS;
    target: GraphicRenderer | undefined;
};

export type SlideKeyboardEvent = CustomEvent<SlideKeyboardEventPayload>;
export type SlideKeyboardEventPayload = {
    baseEvent: KeyboardEvent;
    slide: SlideRenderer;
    type: SLIDE_EVENTS;
    target: GraphicRenderer | undefined;
};

// ELLIPSE EVENTS
export enum ELLIPSE_EVENTS {
    MOUSEUP = 'deck-ellipse-mouseup',
    MOUSEDOWN = 'deck-ellipse-mousedown',
    MOUSEOVER = 'deck-ellipse-mouseover',
    MOUSEOUT = 'deck-ellipse-mouseout',
    MOUSEMOVE = 'deck-ellipse-mousemove'
}

export type EllipseMouseEvent = CustomEvent<EllipseMouseEventPayload>;
export type EllipseMouseEventPayload = {
    baseEvent: MouseEvent;
    slide: SlideRenderer;
    type: ELLIPSE_EVENTS;
    target: EllipseRenderer;
};

// IMAGE EVENTS
export enum IMAGE_EVENTS {
    MOUSEUP = 'deck-image-mouseup',
    MOUSEDOWN = 'deck-image-mousedown',
    MOUSEOVER = 'deck-image-mouseover',
    MOUSEOUT = 'deck-image-mouseout',
    MOUSEMOVE = 'deck-image-mousemove'
}

export type ImageMouseEvent = CustomEvent<ImageMouseEventPayload>;
export type ImageMouseEventPayload = {
    baseEvent: MouseEvent;
    slide: SlideRenderer;
    type: IMAGE_EVENTS;
    target: ImageRenderer;
};

// RECTANGLE EVENTS
export enum RECTANGLE_EVENTS {
    MOUSEUP = 'deck-rectangle-mouseup',
    MOUSEDOWN = 'deck-rectangle-mousedown',
    MOUSEOVER = 'deck-rectangle-mouseover',
    MOUSEOUT = 'deck-rectangle-mouseout',
    MOUSEMOVE = 'deck-rectangle-mousemove'
}

export type RectangleMouseEvent = CustomEvent<RectangleMouseEventPayload>;
export type RectangleMouseEventPayload = {
    baseEvent: MouseEvent;
    slide: SlideRenderer;
    type: RECTANGLE_EVENTS;
    target: RectangleRenderer;
};

// CURVE EVENTS
export enum CURVE_EVENTS {
    MOUSEUP = 'deck-curve-mouseup',
    MOUSEDOWN = 'deck-curve-mousedown',
    MOUSEOVER = 'deck-curve-mouseover',
    MOUSEOUT = 'deck-curve-mouseout',
    MOUSEMOVE = 'deck-curve-mousemove'
}

export type CurveMouseEvent = CustomEvent<CurveMouseEventPayload>;
export type CurveMouseEventPayload = {
    baseEvent: MouseEvent;
    slide: SlideRenderer;
    type: CURVE_EVENTS;
    target: CurveRenderer;
};

// VERTEX EVENTS
export enum VERTEX_EVENTS {
    MOUSEUP = 'deck-vertex-mouseup',
    MOUSEDOWN = 'deck-vertex-mousedown',
    MOUSEOVER = 'deck-vertex-mouseover',
    MOUSEOUT = 'deck-vertex-mouseout',
    MOUSEMOVE = 'deck-vertex-mousemove'
}

export type VertexMouseEvent = CustomEvent<VertexMouseEventPayload>;
export type VertexMouseEventPayload = {
    baseEvent: MouseEvent;
    slide: SlideRenderer;
    type: VERTEX_EVENTS;
    location: string;
};
