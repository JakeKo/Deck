import * as SVG from 'svg.js';
import ImageRenderer from '../../rendering/graphics/ImageRenderer';
import SlideRenderer from "../../rendering/SlideRenderer";
import { ImageMouseEvent, ImageMouseEventPayload, IMAGE_EVENTS, SLIDE_EVENTS } from '../types';
import { dispatch, makeSlideMouseEvent } from '../utilities';

function makeImageMouseEvent(name: IMAGE_EVENTS, slide: SlideRenderer, target: ImageRenderer, baseEvent: MouseEvent): ImageMouseEvent {
    return new CustomEvent<ImageMouseEventPayload>(name, { detail: { type: name, slide, target, baseEvent } });
}

export function decorateImageEvents(svg: SVG.Element, slide: SlideRenderer, graphic: ImageRenderer) {
    svg.node.addEventListener('mouseup', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeImageMouseEvent(IMAGE_EVENTS.MOUSEUP, slide, graphic, baseEvent));
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEUP, slide, graphic, baseEvent));
    });

    svg.node.addEventListener('mousedown', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeImageMouseEvent(IMAGE_EVENTS.MOUSEDOWN, slide, graphic, baseEvent));
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEDOWN, slide, graphic, baseEvent));
    });

    svg.node.addEventListener('mouseover', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeImageMouseEvent(IMAGE_EVENTS.MOUSEOVER, slide, graphic, baseEvent));
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEOVER, slide, graphic, baseEvent));
    });

    svg.node.addEventListener('mouseleave', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeImageMouseEvent(IMAGE_EVENTS.MOUSEOUT, slide, graphic, baseEvent));
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEOUT, slide, graphic, baseEvent));
    });

    svg.node.addEventListener('mousemove', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeImageMouseEvent(IMAGE_EVENTS.MOUSEMOVE, slide, graphic, baseEvent));
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEMOVE, slide, graphic, baseEvent));
    });
}
