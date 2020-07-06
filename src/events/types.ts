import { CurveRenderer, RectangleRenderer } from "../rendering/graphics";
import SlideRenderer from "../rendering/SlideRenderer";
import { GraphicRenderer } from "../rendering/types";

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
