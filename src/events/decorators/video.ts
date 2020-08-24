import { VideoRenderer } from '@/rendering/graphics';
import SlideRenderer from '@/rendering/SlideRenderer';
import SVG from 'svg.js';
import { SLIDE_EVENTS, VideoMouseEvent, VideoMouseEventPayload, VIDEO_EVENTS } from '../types';
import { dispatch, makeSlideMouseEvent } from '../utilities';

function makeVideoMouseEvent(name: VIDEO_EVENTS, slide: SlideRenderer, target: VideoRenderer, baseEvent: MouseEvent): VideoMouseEvent {
    return new CustomEvent<VideoMouseEventPayload>(name, { detail: { type: name, slide, target, baseEvent } });
}

export function decorateVideoEvents(svg: SVG.Element, slide: SlideRenderer, graphic: VideoRenderer) {
    svg.node.addEventListener('mouseup', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeVideoMouseEvent(VIDEO_EVENTS.MOUSEUP, slide, graphic, baseEvent));
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEUP, slide, graphic, baseEvent));
    });

    svg.node.addEventListener('mousedown', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeVideoMouseEvent(VIDEO_EVENTS.MOUSEDOWN, slide, graphic, baseEvent));
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEDOWN, slide, graphic, baseEvent));
    });

    svg.node.addEventListener('mouseover', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeVideoMouseEvent(VIDEO_EVENTS.MOUSEOVER, slide, graphic, baseEvent));
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEOVER, slide, graphic, baseEvent));
    });

    svg.node.addEventListener('mouseleave', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeVideoMouseEvent(VIDEO_EVENTS.MOUSEOUT, slide, graphic, baseEvent));
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEOUT, slide, graphic, baseEvent));
    });

    svg.node.addEventListener('mousemove', baseEvent => {
        baseEvent.stopPropagation();
        dispatch(makeVideoMouseEvent(VIDEO_EVENTS.MOUSEMOVE, slide, graphic, baseEvent));
        dispatch(makeSlideMouseEvent(SLIDE_EVENTS.MOUSEMOVE, slide, graphic, baseEvent));
    });
}
