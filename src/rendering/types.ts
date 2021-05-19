import { SlideMouseEvent } from '@/events/types';
import { Viewbox } from '@/store/types';
import {
    CurveMutableSerialized,
    CurveSerialized,
    EllipseMutableSerialized,
    EllipseSerialized,
    GraphicMutableSerialized,
    GraphicSerialized,
    ImageMutableSerialized,
    ImageSerialized,
    RectangleMutableSerialized,
    RectangleSerialized,
    TextboxMutableSerialized,
    TextboxSerialized,
    VideoMutableSerialized,
    VideoSerialized
} from '@/types';
import SnapVector from '@/utilities/SnapVector';
import V from '@/utilities/Vector';
import SVG from 'svg.js';

export type IGraphicRenderer = ICurveRenderer
    | IEllipseRenderer
    | IImageRenderer
    | IRectangleRenderer
    | ITextboxRenderer
    | IVideoRenderer;

type BaseGraphicRenderer = {
    readonly id: string;
    readonly isRendered: boolean;
    rotation: number;
    readonly staticBox: BoundingBox;
    readonly transformedBox: BoundingBox;
    readonly pullPoints: V[];
    readonly staticSnapVectors: SnapVector[];
    readonly transformedSnapVectors: SnapVector[];
    render: () => void;
    unrender: () => void;
};

export type ICurveRenderer = BaseGraphicRenderer & {
    readonly type: GRAPHIC_TYPES.CURVE;
    anchors: CurveAnchor[];
    fillColor: string;
    strokeColor: string;
    strokeWidth: number;
    getAnchor: (index: number) => CurveAnchor;
    setAnchor: (index: number, anchor: CurveAnchor) => void;
    addAnchor: (anchor: CurveAnchor) => number;
    removeAnchor: (index: number) => void;
    setProps: (props: CurveMutableSerialized) => void;
};

export type IEllipseRenderer = BaseGraphicRenderer & {
    readonly type: GRAPHIC_TYPES.ELLIPSE;
    center: V;
    dimensions: V;
    fillColor: string;
    strokeColor: string;
    strokeWidth: number;
    setCenterAndDimensions: (center: V, dimensions: V) => void;
    setProps: (props: EllipseMutableSerialized) => void;
};

export type IImageRenderer = BaseGraphicRenderer & {
    readonly type: GRAPHIC_TYPES.IMAGE;
    readonly source: string;
    origin: V;
    dimensions: V;
    setOriginAndDimensions: (origin: V, dimensions: V) => void;
    setProps: (props: ImageMutableSerialized) => void;
};

export type IRectangleRenderer = BaseGraphicRenderer & {
    readonly type: GRAPHIC_TYPES.RECTANGLE;
    origin: V;
    dimensions: V;
    fillColor: string;
    strokeColor: string;
    strokeWidth: number;
    setOriginAndDimensions: (origin: V, dimensions: V) => void;
    setProps: (props: RectangleMutableSerialized) => void;
};

export type ITextboxRenderer = BaseGraphicRenderer & {
    readonly type: GRAPHIC_TYPES.TEXTBOX;
    origin: V;
    dimensions: V;
    text: string;
    fontSize: number;
    fontWeight: string;
    typeface: string;
    setOriginAndDimensions: (origin: V, dimensions: V) => void;
    setProps: (props: TextboxMutableSerialized) => void;
};

export type IVideoRenderer = BaseGraphicRenderer & {
    readonly type: GRAPHIC_TYPES.VIDEO;
    readonly source: string;
    origin: V;
    dimensions: V;
    strokeColor: string;
    strokeWidth: number;
    setOriginAndDimensions: (origin: V, dimensions: V) => void;
    setProps: (props: VideoMutableSerialized) => void;
};

export type IHelperRenderer = IBoxRenderer
    | ICanvasRenderer
    | ICurveAnchorRenderer
    | ICurveOutlineRenderer
    | IEllipseOutlineRenderer
    | IRectangleOutlineRenderer
    | IRotatorRenderer
    | IVertexRenderer

type BaseHelperRenderer = {
    readonly type: GRAPHIC_TYPES;
    readonly isRendered: boolean;
    scale: number;
    render: () => void;
    unrender: () => void;
};

export type IBoxRenderer = BaseHelperRenderer & {
    readonly type: GRAPHIC_TYPES.BOX;
    origin: V;
    dimensions: V;
    rotation: number;
    setOriginAndDimensions: (origin: V, dimensions: V) => void;
};

export type ICanvasRenderer = BaseHelperRenderer & {
    readonly type: GRAPHIC_TYPES.CANVAS;
};

export type ICurveAnchorRenderer = BaseHelperRenderer & {
    readonly type: GRAPHIC_TYPES.CURVE_ANCHOR;
    inHandle: V;
    point: V;
    outHandle: V;
};

export type ICurveOutlineRenderer = BaseHelperRenderer & {
    readonly type: GRAPHIC_TYPES.CURVE_OUTLINE;
};

export type IEllipseOutlineRenderer = BaseHelperRenderer & {
    readonly type: GRAPHIC_TYPES.ELLIPSE_OUTLINE;
    center: V;
    dimensions: V;
    setCenterAndDimensions: (center: V, dimensions: V) => void;
};

export type IRectangleOutlineRenderer = BaseHelperRenderer & {
    readonly type: GRAPHIC_TYPES.RECTANGLE_OUTLINE;
    origin: V;
    dimensions: V;
    setOriginAndDimensions: (origin: V, dimensions: V) => void;
};

export type IRotatorRenderer = BaseHelperRenderer & {
    readonly type: GRAPHIC_TYPES.ROTATOR;
    readonly parent: IGraphicRenderer;
    center: V;
    rotation: number;
};

export type ISnapVectorRenderer = BaseHelperRenderer & {
    readonly type: GRAPHIC_TYPES.SNAP_VECTOR;
    snapVector: SnapVector;
}

export type IVertexRenderer = BaseHelperRenderer & {
    readonly type: GRAPHIC_TYPES.VERTEX;
    readonly role: VERTEX_ROLES;
    readonly parentId: string;
    center: V;
}

export type IGraphicMaker = ICurveMaker
    | IEllipseMaker
    | IImageMaker
    | IRectangleMaker
    | ITextboxMaker
    | IVideoMaker;

export type IGraphicMakerBase = {
    scale: number;
    updateHelpers: () => void;
};

export type ICurveMaker = IGraphicMakerBase & {
    create: (props: CurveMutableSerialized) => CurveSerialized;
    initDraw: () => (event: SlideMouseEvent) => CurveMutableSerialized;
    endDraw: () => CurveMutableSerialized;
    addAnchor: (event: SlideMouseEvent) => CurveMutableSerialized;
    initCreateAnchor: () => (event: SlideMouseEvent) => CurveMutableSerialized;
    endCreateAnchor: () => void;
};

// ICurveMaker _doesn't_ have a "resize" operation.
// Resize methods _must_ be specified at the individual type instead of at IGraphicMakerBase.
export type IEllipseMaker = IGraphicMakerBase & {
    create: (props: EllipseMutableSerialized) => EllipseSerialized;
    initResize: (basePoint: V) => (event: SlideMouseEvent) => EllipseMutableSerialized;
    endResize: () => void;
};

export type IImageMaker = IGraphicMakerBase & {
    create: (props: ImageMutableSerialized & Pick<ImageSerialized, 'source' | 'dimensions'>) => ImageSerialized;
    initResize: (basePoint: V) => (event: SlideMouseEvent) => ImageMutableSerialized;
    endResize: () => void;
};

export type IRectangleMaker = IGraphicMakerBase & {
    create: (props: RectangleMutableSerialized) => RectangleSerialized;
    initResize: (basePoint: V) => (event: SlideMouseEvent) => RectangleMutableSerialized;
    endResize: () => void;
};

export type ITextboxMaker = IGraphicMakerBase & {
    create: (props: TextboxMutableSerialized) => TextboxSerialized;
    initResize: (basePoint: V) => (event: SlideMouseEvent) => TextboxMutableSerialized;
    endResize: () => void;
};

export type IVideoMaker = IGraphicMakerBase & {
    create: (props: VideoMutableSerialized & Pick<VideoSerialized, 'source' | 'dimensions'>) => VideoSerialized;
    initResize: (basePoint: V) => (event: SlideMouseEvent) => VideoMutableSerialized;
    endResize: () => void;
};

export type IGraphicMarker = {
    scale: number;
    unmark: () => void;
};

export type IGraphicMutator = ICurveMutator
    | IEllipseMutator
    | IImageMutator
    | IRectangleMutator
    | ITextboxMutator
    | IVideoMutator;

export type IGraphicMutatorBase<T extends GRAPHIC_TYPES, U extends GraphicMutableSerialized> = {
    readonly type: T;
    scale: number;
    updateHelpers: () => void;
    focus: () => void;
    unfocus: () => void;
    initMove: (initialPosition: V) => (event: SlideMouseEvent) => U;
    endMove: () => void;
    initVertexMove: (role: VERTEX_ROLES) => (event: SlideMouseEvent) => U;
    endVertexMove: () => void;
    initRotate: () => (event: SlideMouseEvent) => U;
    endRotate: () => void;
};

export type ICurveMutator = IGraphicMutatorBase<GRAPHIC_TYPES.CURVE, CurveMutableSerialized> & {
    initAnchorMove: (index: number, role: CURVE_ANCHOR_ROLES) => (event: SlideMouseEvent) => CurveMutableSerialized;
    endAnchorMove: () => void;
};

export type IEllipseMutator = IGraphicMutatorBase<GRAPHIC_TYPES.ELLIPSE, EllipseMutableSerialized>;

export type IImageMutator = IGraphicMutatorBase<GRAPHIC_TYPES.IMAGE, ImageMutableSerialized>;

export type IRectangleMutator = IGraphicMutatorBase<GRAPHIC_TYPES.RECTANGLE, RectangleMutableSerialized>;

export type ITextboxMutator = IGraphicMutatorBase<GRAPHIC_TYPES.TEXTBOX, TextboxMutableSerialized>;

export type IVideoMutator = IGraphicMutatorBase<GRAPHIC_TYPES.VIDEO, VideoMutableSerialized>;

export type ISlideRenderer = {
    eventPublisherId: string;
    slideId: string;
    readonly canvas: SVG.Doc;
    readonly rawViewbox: Viewbox;
    readonly zoom: number;
    readonly bounds: { origin: V; dimensions: V };
    setCursor: (cursor: string) => void;
    lockCursor: (cursor: string) => void;
    unlockCursor: (cursor?: string) => void;
    getSnapVectors: (exclude: string[]) => SnapVector[];
    createGraphic: (props: GraphicSerialized, render?: boolean, emit?: boolean) => IGraphicRenderer;
    initInteractiveCreate: (graphicId: string, graphicType: GRAPHIC_TYPES) => IGraphicMaker;
    endInteractiveCreate: (graphicId: string) => void;
    getGraphic: (graphicId: string) => IGraphicRenderer;
    removeGraphic: (graphicId: string, emit?: boolean) => void;
    focusGraphic: (graphicId: string, emit?: boolean) => IGraphicMutator;
    unfocusGraphic: (graphicId: string, emit?: boolean) => void;
    unfocusAllGraphics: (exclude?: string[]) => void;
    isFocused: (graphicId: string) => boolean;
    markGraphic: (graphicId: string) => IGraphicMarker;
    unmarkGraphic: (graphicId: string) => void;
    isMarked: (graphicId: string) => boolean;
    setProps: (graphicId: string, graphicType: GRAPHIC_TYPES, props: GraphicMutableSerialized, emit?: boolean) => void;
};

export type BoundingBoxMutatorHelpers = {
    box: IBoxRenderer;
    rotator: IRotatorRenderer;
    vertices: { [key in VERTEX_ROLES]: IVertexRenderer };
};

export type BoundingBox = {
    origin: V;
    center: V;
    dimensions: V;
    topLeft: V;
    topRight: V;
    bottomLeft: V;
    bottomRight: V;
    rotation: number;
};

export type CurveAnchor = {
    inHandle: V;
    point: V;
    outHandle: V;
};

export enum GRAPHIC_TYPES {
    BOX = 'box',
    CANVAS = 'canvas',
    CURVE = 'curve',
    CURVE_ANCHOR = 'curve-anchor',
    CURVE_OUTLINE = 'curve-outline',
    ELLIPSE = 'ellipse',
    ELLIPSE_OUTLINE = 'ellipse-outline',
    IMAGE = 'image',
    RECTANGLE = 'rectangle',
    RECTANGLE_OUTLINE = 'rectangle-outline',
    ROTATOR = 'rotator',
    SNAP_VECTOR = 'snap-vector',
    TEXTBOX = 'textbox',
    VERTEX = 'vertex',
    VIDEO = 'video'
}

export enum VERTEX_ROLES {
    TOP_LEFT = 'top-left',
    TOP_RIGHT = 'top-right',
    BOTTOM_LEFT = 'bottom-left',
    BOTTOM_RIGHT = 'bottom-right'
}

export enum CURVE_ANCHOR_ROLES {
    IN_HANDLE = 'in-handle',
    POINT = 'point',
    OUT_HANDLE = 'out-handle'
}
