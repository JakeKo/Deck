import Vector from '../models/Vector';
import SlideRenderer from './SlideRenderer';

export type GraphicRenderer = {
    id: string;
    type: string;
    isRendered: boolean;
    render: () => void;
    unrender: () => void;
};

export type CurveAnchor = {
    inHandle: Vector | undefined;
    point: Vector;
    outHandle: Vector | undefined;
};

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
