import SlideRenderer from "../rendering/SlideRenderer";

export enum EVENT_CATEGORIES {
    SLIDE_MOUSE = 'deck-slide-mouse-event',
    SLIDE_KEYBOARD = 'deck-slide-keyboard-event',
    GRAPHIC_MOUSE = 'deck-graphic-mouse-event',
    VERTEX_MOUSE = 'deck-vertex-mouse-event',
}

// TODO: Consider making isElementEvent more specific (containing element event?)
export type SlideMouseEventPayload = {
    baseEvent: MouseEvent;
    slideRenderer: SlideRenderer;
    isElementEvent: boolean;
    category: EVENT_CATEGORIES.SLIDE_MOUSE;
};

export type SlideMouseEvent = CustomEvent<SlideMouseEventPayload>;

export type SlideKeyboardEventPayload = {
    baseEvent: KeyboardEvent;
    slideRenderer: SlideRenderer;
    isElementEvent: boolean;
    category: EVENT_CATEGORIES.SLIDE_KEYBOARD;
};

export type SlideKeyboardEvent = CustomEvent<SlideKeyboardEventPayload>;

export type GraphicMouseEventPayload = {
    baseEvent: MouseEvent;
    slideRenderer: SlideRenderer;
    graphicId: string;
    category: EVENT_CATEGORIES.GRAPHIC_MOUSE;
};

export type GraphicMouseEvent = CustomEvent<GraphicMouseEventPayload>;

export type VertexMouseEventPayload = {
    baseEvent: MouseEvent;
    slideRenderer: SlideRenderer;
    vertexLocation: string;
    category: EVENT_CATEGORIES.VERTEX_MOUSE;
};

export type VertexMouseEvent = CustomEvent<VertexMouseEventPayload>;

export enum SLIDE_EVENTS {
    MOUSEUP = 'deck-slide-mouseup',
    MOUSEDOWN = 'deck-slide-mousedown',
    MOUSEOVER = 'deck-slide-mouseover',
    MOUSEOUT = 'deck-slide-mouseout',
    MOUSEMOVE = 'deck-slide-mousemove',
    KEYDOWN = 'deck-slide-keydown',
    KEYUP = 'deck-slide-keyup'
}

export enum GRAPHIC_EVENTS {
    MOUSEUP = 'deck-graphic-mouseup',
    MOUSEDOWN = 'deck-graphic-mousedown',
    MOUSEOVER = 'deck-graphic-mouseover',
    MOUSEOUT = 'deck-graphic-mouseout',
    MOUSEMOVE = 'deck-graphic-mousemove'
}

export enum VERTEX_EVENTS {
    MOUSEUP = 'deck-vertex-mouseup',
    MOUSEDOWN = 'deck-vertex-mousedown',
    MOUSEOVER = 'deck-vertex-mouseover',
    MOUSEOUT = 'deck-vertex-mouseout',
    MOUSEMOVE = 'deck-vertex-mousemove',
}
