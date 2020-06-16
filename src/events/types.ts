import SlideRenderer from "../rendering/SlideRenderer";

export type SlideMouseEventPayload = {
    baseEvent: MouseEvent;
    slideRenderer: SlideRenderer;
};

export type SlideKeyboardEventPayload = {
    baseEvent: KeyboardEvent;
    slideRenderer: SlideRenderer;
};

export type GraphicMouseEventPayload = {
    baseEvent: MouseEvent;
    slideRenderer: SlideRenderer;
    graphicId: string;
};

export type GraphicKeyboardEventPayload = {
    baseEvent: KeyboardEvent;
    slideRenderer: SlideRenderer;
    graphicId: string;
};
