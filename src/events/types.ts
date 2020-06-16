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
