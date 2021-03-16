import {
    CURVE_ANCHOR_ROLES,
    GRAPHIC_TYPES,
    ICurveRenderer,
    IEllipseRenderer,
    IGraphicRenderer,
    IHelperRenderer,
    IImageRenderer,
    IRectangleRenderer,
    ISlideRenderer,
    ITextboxRenderer,
    IVertexRenderer,
    IVideoRenderer
} from '@/rendering/types';
import { CurveMutableSerialized, CurveSerialized, EllipseMutableSerialized, EllipseSerialized, ImageMutableSerialized, ImageSerialized, RectangleMutableSerialized, RectangleSerialized, TextboxMutableSerialized, TextboxSerialized, VideoMutableSerialized, VideoSerialized } from '@/types';

export type DECK_EVENTS = SLIDE_EVENTS | GRAPHIC_EVENTS | HELPER_EVENTS;
type GRAPHIC_EVENTS = CURVE_EVENTS | ELLIPSE_EVENTS | IMAGE_EVENTS | RECTANGLE_EVENTS | TEXTBOX_EVENTS | VIDEO_EVENTS;
type HELPER_EVENTS = CURVE_ANCHOR_EVENTS | ROTATOR_EVENTS | VERTEX_EVENTS;

export type DeckCustomEvent = GraphicMouseEvent | SlideMouseEvent | SlideKeyboardEvent | SlideZoomEvent;
export type DeckCustomEventPayload = SlideMouseEventPayload | SlideKeyboardEventPayload | SlideZoomEventPayload
    | CurveMouseEventPayload | EllipseMouseEventPayload | ImageMouseEventPayload | RectangleMouseEventPayload | TextboxMouseEventPayload | VideoMouseEventPayload
    | CurveAnchorMouseEventPayload | RotatorMouseEventPayload | VertexMouseEventPayload;

export type GraphicMouseEvent = CurveMouseEvent | EllipseMouseEvent | ImageMouseEvent | RectangleMouseEvent | TextboxMouseEvent | VideoMouseEvent;

// SLIDE EVENTS
export enum SLIDE_EVENTS {
    MOUSEUP = 'deck-slide-mouseup',
    MOUSEDOWN = 'deck-slide-mousedown',
    MOUSEOVER = 'deck-slide-mouseover',
    MOUSEOUT = 'deck-slide-mouseout',
    MOUSEMOVE = 'deck-slide-mousemove',
    KEYDOWN = 'deck-slide-keydown',
    KEYUP = 'deck-slide-keyup',
    ZOOM = 'deck-slide-zoom'
}

export type SlideMouseEvent = CustomEvent<SlideMouseEventPayload>;
export type SlideMouseEventPayload = {
    baseEvent: MouseEvent;
    slide: ISlideRenderer;
    type: SLIDE_EVENTS;
    target: IGraphicRenderer | IHelperRenderer | undefined;
};

export type SlideKeyboardEvent = CustomEvent<SlideKeyboardEventPayload>;
export type SlideKeyboardEventPayload = {
    baseEvent: KeyboardEvent;
    slide: ISlideRenderer;
    type: SLIDE_EVENTS;
    target: IGraphicRenderer | undefined;
};

export type SlideZoomEvent = CustomEvent<SlideZoomEventPayload>;
export type SlideZoomEventPayload = {
    zoom: number;
};

// CURVE EVENTS
export enum CURVE_EVENTS {
    MOUSEUP = 'deck-curve-mouseup',
    MOUSEDOWN = 'deck-curve-mousedown',
    MOUSEOVER = 'deck-curve-mouseover',
    MOUSEOUT = 'deck-curve-mouseout',
    MOUSEMOVE = 'deck-curve-mousemove',
    CREATED = 'deck-curve-created',
    UPDATED = 'deck-curve-updated',
    DELETE = 'deck-curve-delete'
}

export type CurveMouseEvent = CustomEvent<CurveMouseEventPayload>;
export type CurveMouseEventPayload = {
    baseEvent: MouseEvent;
    slide: ISlideRenderer;
    type: CURVE_EVENTS;
    target: ICurveRenderer;
};

export type CurveCreated = CustomEvent<CurveCreatedPayload>;
export type CurveCreatedPayload = {
    slideId: string;
    props: CurveSerialized;
};

export type CurveUpdated = CustomEvent<CurveUpdatedPayload>;
export type CurveUpdatedPayload = {
    slideId: string;
    graphicId: string;
    type: GRAPHIC_TYPES.CURVE;
    props: CurveMutableSerialized;
};

export type CurveDeleted = CustomEvent<CurveDeletedPayload>;
export type CurveDeletedPayload = {
    slideId: string;
    graphicId: string;
    type: GRAPHIC_TYPES.CURVE;
};

// CURVE ANCHOR EVENTS
export enum CURVE_ANCHOR_EVENTS {
    MOUSEUP = 'deck-curve-anchor-mouseup',
    MOUSEDOWN = 'deck-curve-anchor-mousedown',
    MOUSEOVER = 'deck-curve-anchor-mouseover',
    MOUSEOUT = 'deck-curve-anchor-mouseout',
    MOUSEMOVE = 'deck-curve-anchor-mousemove'
}

export type CurveAnchorMouseEvent = CustomEvent<CurveAnchorMouseEventPayload>;
export type CurveAnchorMouseEventPayload = {
    baseEvent: MouseEvent;
    slide: ISlideRenderer;
    type: CURVE_ANCHOR_EVENTS;
    parentId: string;
    index: number;
    role: CURVE_ANCHOR_ROLES;
};

// ELLIPSE EVENTS
export enum ELLIPSE_EVENTS {
    MOUSEUP = 'deck-ellipse-mouseup',
    MOUSEDOWN = 'deck-ellipse-mousedown',
    MOUSEOVER = 'deck-ellipse-mouseover',
    MOUSEOUT = 'deck-ellipse-mouseout',
    MOUSEMOVE = 'deck-ellipse-mousemove',
    CREATED = 'deck-ellipse-created',
    UPDATED = 'deck-ellipse-updated',
    DELETE = 'deck-ellipse-delete'
}

export type EllipseMouseEvent = CustomEvent<EllipseMouseEventPayload>;
export type EllipseMouseEventPayload = {
    baseEvent: MouseEvent;
    slide: ISlideRenderer;
    type: ELLIPSE_EVENTS;
    target: IEllipseRenderer;
};

export type EllipseCreated = CustomEvent<EllipseCreatedPayload>;
export type EllipseCreatedPayload = {
    slideId: string;
    props: EllipseSerialized;
};

export type EllipseUpdated = CustomEvent<EllipseUpdatedPayload>;
export type EllipseUpdatedPayload = {
    slideId: string;
    graphicId: string;
    type: GRAPHIC_TYPES.ELLIPSE;
    props: EllipseMutableSerialized;
};

export type EllipseDeleted = CustomEvent<EllipseDeletedPayload>;
export type EllipseDeletedPayload = {
    slideId: string;
    graphicId: string;
    type: GRAPHIC_TYPES.ELLIPSE;
};

// IMAGE EVENTS
export enum IMAGE_EVENTS {
    MOUSEUP = 'deck-image-mouseup',
    MOUSEDOWN = 'deck-image-mousedown',
    MOUSEOVER = 'deck-image-mouseover',
    MOUSEOUT = 'deck-image-mouseout',
    MOUSEMOVE = 'deck-image-mousemove',
    CREATED = 'deck-image-created',
    UPDATED = 'deck-image-updated',
    DELETE = 'deck-image-delete'
}

export type ImageMouseEvent = CustomEvent<ImageMouseEventPayload>;
export type ImageMouseEventPayload = {
    baseEvent: MouseEvent;
    slide: ISlideRenderer;
    type: IMAGE_EVENTS;
    target: IImageRenderer;
};

export type ImageCreated = CustomEvent<ImageCreatedPayload>;
export type ImageCreatedPayload = {
    slideId: string;
    props: ImageSerialized;
};

export type ImageUpdated = CustomEvent<ImageUpdatedPayload>;
export type ImageUpdatedPayload = {
    slideId: string;
    graphicId: string;
    type: GRAPHIC_TYPES.IMAGE;
    props: ImageMutableSerialized;
};

export type ImageDeleted = CustomEvent<ImageDeletedPayload>;
export type ImageDeletedPayload = {
    slideId: string;
    graphicId: string;
    type: GRAPHIC_TYPES.IMAGE;
};

// RECTANGLE EVENTS
export enum RECTANGLE_EVENTS {
    MOUSEUP = 'deck-rectangle-mouseup',
    MOUSEDOWN = 'deck-rectangle-mousedown',
    MOUSEOVER = 'deck-rectangle-mouseover',
    MOUSEOUT = 'deck-rectangle-mouseout',
    MOUSEMOVE = 'deck-rectangle-mousemove',
    CREATED = 'deck-rectangle-created',
    UPDATED = 'deck-rectangle-updated',
    DELETE = 'deck-rectangle-delete'
}

export type RectangleMouseEvent = CustomEvent<RectangleMouseEventPayload>;
export type RectangleMouseEventPayload = {
    baseEvent: MouseEvent;
    slide: ISlideRenderer;
    type: RECTANGLE_EVENTS;
    target: IRectangleRenderer;
};

export type RectangleCreated = CustomEvent<RectangleCreatedPayload>;
export type RectangleCreatedPayload = {
    slideId: string;
    props: RectangleSerialized;
};

export type RectangleUpdated = CustomEvent<RectangleUpdatedPayload>;
export type RectangleUpdatedPayload = {
    slideId: string;
    graphicId: string;
    type: GRAPHIC_TYPES.RECTANGLE;
    props: RectangleMutableSerialized;
};

export type RectangleDeleted = CustomEvent<RectangleDeletedPayload>;
export type RectangleDeletedPayload = {
    slideId: string;
    graphicId: string;
    type: GRAPHIC_TYPES.RECTANGLE;
};

// ROTATOR EVENTS
export enum ROTATOR_EVENTS {
    MOUSEUP = 'deck-rotator-mouseup',
    MOUSEDOWN = 'deck-rotator-mousedown',
    MOUSEOVER = 'deck-rotator-mouseover',
    MOUSEOUT = 'deck-rotator-mouseout',
    MOUSEMOVE = 'deck-rotator-mousemove'
}

export type RotatorMouseEvent = CustomEvent<RotatorMouseEventPayload>;
export type RotatorMouseEventPayload = {
    baseEvent: MouseEvent;
    slide: ISlideRenderer;
    type: ROTATOR_EVENTS;
    parentId: string;
};

// TEXTBOX EVENTS
export enum TEXTBOX_EVENTS {
    MOUSEUP = 'deck-textbox-mouseup',
    MOUSEDOWN = 'deck-textbox-mousedown',
    MOUSEOVER = 'deck-textbox-mouseover',
    MOUSEOUT = 'deck-textbox-mouseout',
    MOUSEMOVE = 'deck-textbox-mousemove',
    CREATED = 'deck-textbox-created',
    UPDATED = 'deck-textbox-updated',
    DELETE = 'deck-textbox-delete'
}

export type TextboxMouseEvent = CustomEvent<TextboxMouseEventPayload>;
export type TextboxMouseEventPayload = {
    baseEvent: MouseEvent;
    slide: ISlideRenderer;
    type: TEXTBOX_EVENTS;
    target: ITextboxRenderer;
};

export type TextboxCreated = CustomEvent<TextboxCreatedPayload>;
export type TextboxCreatedPayload = {
    slideId: string;
    props: TextboxSerialized;
};

export type TextboxUpdated = CustomEvent<TextboxUpdatedPayload>;
export type TextboxUpdatedPayload = {
    slideId: string;
    graphicId: string;
    type: GRAPHIC_TYPES.TEXTBOX;
    props: TextboxMutableSerialized;
};

export type TextboxDeleted = CustomEvent<TextboxDeletedPayload>;
export type TextboxDeletedPayload = {
    slideId: string;
    graphicId: string;
    type: GRAPHIC_TYPES.TEXTBOX;
};

// VIDEO EVENTS
export enum VIDEO_EVENTS {
    MOUSEUP = 'deck-video-mouseup',
    MOUSEDOWN = 'deck-video-mousedown',
    MOUSEOVER = 'deck-video-mouseover',
    MOUSEOUT = 'deck-video-mouseout',
    MOUSEMOVE = 'deck-video-mousemove',
    CREATED = 'deck-video-created',
    UPDATED = 'deck-video-updated',
    DELETE = 'deck-video-delete'
}

export type VideoMouseEvent = CustomEvent<VideoMouseEventPayload>;
export type VideoMouseEventPayload = {
    baseEvent: MouseEvent;
    slide: ISlideRenderer;
    type: VIDEO_EVENTS;
    target: IVideoRenderer;
};

export type VideoCreated = CustomEvent<VideoCreatedPayload>;
export type VideoCreatedPayload = {
    slideId: string;
    props: VideoSerialized;
};

export type VideoUpdated = CustomEvent<VideoUpdatedPayload>;
export type VideoUpdatedPayload = {
    slideId: string;
    graphicId: string;
    type: GRAPHIC_TYPES.VIDEO;
    props: VideoMutableSerialized;
};

export type VideoDeleted = CustomEvent<VideoDeletedPayload>;
export type VideoDeletedPayload = {
    slideId: string;
    graphicId: string;
    type: GRAPHIC_TYPES.VIDEO;
};

// VERTEX EVENTS
export enum VERTEX_EVENTS {
    MOUSEUP = 'deck-vertex-mouseup',
    MOUSEDOWN = 'deck-vertex-mousedown',
    MOUSEOVER = 'deck-vertex-mouseover',
    MOUSEOUT = 'deck-vertex-mouseout',
    MOUSEMOVE = 'deck-vertex-mousemove'
}

export type VertexMouseEvent = CustomEvent<VertexMouseEventPayload>;
export type VertexMouseEventPayload = {
    baseEvent: MouseEvent;
    slide: ISlideRenderer;
    type: VERTEX_EVENTS;
    target: IVertexRenderer;
};
