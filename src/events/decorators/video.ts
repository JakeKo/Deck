import { ISlideRenderer, IVideoRenderer } from '@/rendering/types';
import { dispatch } from '..';
import { SlideMouseEventPayload, SLIDE_EVENTS, VideoMouseEventPayload, VIDEO_EVENTS } from '../types';

export function decorateVideoEvents(svg: { node: SVGForeignObjectElement}, slide: ISlideRenderer, target: IVideoRenderer) {
    svg.node.addEventListener('mouseup', baseEvent => {
        baseEvent.stopPropagation();
        dispatch<VideoMouseEventPayload>(VIDEO_EVENTS.MOUSEUP, { type: VIDEO_EVENTS.MOUSEUP, slide, target, baseEvent });
        dispatch<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEUP, { type: SLIDE_EVENTS.MOUSEUP, slide, target, baseEvent });
    });

    svg.node.addEventListener('mousedown', baseEvent => {
        baseEvent.stopPropagation();
        dispatch<VideoMouseEventPayload>(VIDEO_EVENTS.MOUSEDOWN, { type: VIDEO_EVENTS.MOUSEDOWN, slide, target, baseEvent });
        dispatch<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEDOWN, { type: SLIDE_EVENTS.MOUSEDOWN, slide, target, baseEvent });
    });

    svg.node.addEventListener('mouseover', baseEvent => {
        baseEvent.stopPropagation();
        dispatch<VideoMouseEventPayload>(VIDEO_EVENTS.MOUSEOVER, { type: VIDEO_EVENTS.MOUSEOVER, slide, target, baseEvent });
        dispatch<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEOVER, { type: SLIDE_EVENTS.MOUSEOVER, slide, target, baseEvent });
    });

    svg.node.addEventListener('mouseleave', baseEvent => {
        baseEvent.stopPropagation();
        dispatch<VideoMouseEventPayload>(VIDEO_EVENTS.MOUSEOUT, { type: VIDEO_EVENTS.MOUSEOUT, slide, target, baseEvent });
        dispatch<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEOUT, { type: SLIDE_EVENTS.MOUSEOUT, slide, target, baseEvent });
    });

    svg.node.addEventListener('mousemove', baseEvent => {
        baseEvent.stopPropagation();
        dispatch<VideoMouseEventPayload>(VIDEO_EVENTS.MOUSEMOVE, { type: VIDEO_EVENTS.MOUSEMOVE, slide, target, baseEvent });
        dispatch<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEMOVE, { type: SLIDE_EVENTS.MOUSEMOVE, slide, target, baseEvent });
    });
}
