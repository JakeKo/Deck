import SlideRenderer from "../rendering/SlideRenderer";

export type SlideMouseEventPayload = {
    baseEvent: MouseEvent;
    slideRenderer: SlideRenderer;
};

export type SlideMouseEvent = CustomEvent<SlideMouseEventPayload>;

export type SlideKeyboardEventPayload = {
    baseEvent: KeyboardEvent;
    slideRenderer: SlideRenderer;
};

export type SlideKeyboardEvent = CustomEvent<SlideKeyboardEventPayload>;

export type GraphicMouseEventPayload = {
    baseEvent: MouseEvent;
    slideRenderer: SlideRenderer;
    graphicId: string;
};

export type GraphicMouseEvent = CustomEvent<GraphicMouseEventPayload>;

export type GraphicKeyboardEventPayload = {
    baseEvent: KeyboardEvent;
    slideRenderer: SlideRenderer;
    graphicId: string;
};

export type GraphicKeyboardEvent = CustomEvent<GraphicKeyboardEventPayload>;

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
    MOUSEMOVE = 'deck-graphic-mousemove',
    KEYDOWN = 'deck-graphic-keydown',
    KEYUP = 'deck-graphic-keyup'
}
