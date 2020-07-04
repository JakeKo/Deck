import SlideRenderer from "./SlideRenderer";
import * as SVG from 'svg.js';
import { GraphicMouseEventPayload, GRAPHIC_EVENTS, GraphicKeyboardEventPayload } from "../events/types";

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
