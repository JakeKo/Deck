import * as SVG from 'svg.js';
import { GraphicKeyboardEventPayload, GraphicMouseEventPayload, GRAPHIC_EVENTS, SlideKeyboardEventPayload, SlideMouseEventPayload, SLIDE_EVENTS } from "../events/types";
import Vector from '../utilities/Vector';
import { CanvasRenderer } from './helpers';
import SlideRenderer from "./SlideRenderer";

// TODO: Determine if slide events need to be decorated here
export function decorateGraphicEvents(svg: SVG.Element, slideRenderer: SlideRenderer, graphicId: string) {
    svg.node.addEventListener('mouseup', baseEvent => {
        document.dispatchEvent(new CustomEvent<GraphicMouseEventPayload>(GRAPHIC_EVENTS.MOUSEUP, {
            detail: { slideRenderer, graphicId, baseEvent }
        }));
    });

    svg.node.addEventListener('mousedown', baseEvent => {
        document.dispatchEvent(new CustomEvent<GraphicMouseEventPayload>(GRAPHIC_EVENTS.MOUSEDOWN, {
            detail: { slideRenderer, graphicId, baseEvent }
        }));
    });

    svg.node.addEventListener('mouseover', baseEvent => {
        document.dispatchEvent(new CustomEvent<GraphicMouseEventPayload>(GRAPHIC_EVENTS.MOUSEOVER, {
            detail: { slideRenderer, graphicId, baseEvent }
        }));
    });

    svg.node.addEventListener('mouseout', baseEvent => {
        document.dispatchEvent(new CustomEvent<GraphicMouseEventPayload>(GRAPHIC_EVENTS.MOUSEOUT, {
            detail: { slideRenderer, graphicId, baseEvent }
        }));
    });

    svg.node.addEventListener('mousemove', baseEvent => {
        document.dispatchEvent(new CustomEvent<GraphicMouseEventPayload>(GRAPHIC_EVENTS.MOUSEMOVE, {
            detail: { slideRenderer, graphicId, baseEvent }
        }));
    });

    svg.node.addEventListener('keyup', baseEvent => {
        document.dispatchEvent(new CustomEvent<GraphicKeyboardEventPayload>(GRAPHIC_EVENTS.KEYUP, {
            detail: { slideRenderer, graphicId, baseEvent }
        }));
    });

    svg.node.addEventListener('keydown', baseEvent => {
        document.dispatchEvent(new CustomEvent<GraphicKeyboardEventPayload>(GRAPHIC_EVENTS.KEYDOWN, {
            detail: { slideRenderer, graphicId, baseEvent }
        }));
    });
}

export function decorateSlideEvents(slideRenderer: SlideRenderer): void {
    slideRenderer.canvas.node.addEventListener('mouseup', baseEvent => {
        document.dispatchEvent(new CustomEvent<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEUP, {
            detail: { slideRenderer, baseEvent }
        }));
    });

    slideRenderer.canvas.node.addEventListener('mousedown', baseEvent => {
        document.dispatchEvent(new CustomEvent<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEDOWN, {
            detail: { slideRenderer, baseEvent }
        }));
    });

    slideRenderer.canvas.node.addEventListener('mouseover', baseEvent => {
        document.dispatchEvent(new CustomEvent<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEOVER, {
            detail: { slideRenderer, baseEvent }
        }));
    });

    slideRenderer.canvas.node.addEventListener('mouseout', baseEvent => {
        document.dispatchEvent(new CustomEvent<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEOUT, {
            detail: { slideRenderer, baseEvent }
        }));
    });

    slideRenderer.canvas.node.addEventListener('mousemove', baseEvent => {
        document.dispatchEvent(new CustomEvent<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEMOVE, {
            detail: { slideRenderer, baseEvent }
        }));
    });

    slideRenderer.canvas.node.addEventListener('keyup', baseEvent => {
        document.dispatchEvent(new CustomEvent<SlideKeyboardEventPayload>(SLIDE_EVENTS.KEYUP, {
            detail: { slideRenderer, baseEvent }
        }));
    });

    slideRenderer.canvas.node.addEventListener('keydown', baseEvent => {
        document.dispatchEvent(new CustomEvent<SlideKeyboardEventPayload>(SLIDE_EVENTS.KEYDOWN, {
            detail: { slideRenderer, baseEvent }
        }));
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
