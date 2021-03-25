import { SlideMouseEvent } from '@/events/types';
import { Viewbox } from '@/store/types';
import {
    CurveMutableSerialized,
    EllipseMutableSerialized,
    GraphicMutableSerialized,
    ImageMutableSerialized,
    RectangleMutableSerialized,
    TextboxMutableSerialized,
    VideoMutableSerialized
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
    readonly parent: IGraphicRenderer;
    center: V;
}

export type IGraphicMaker = ICurveMaker
    | IEllipseMaker
    | IImageMaker
    | IRectangleMaker
    | ITextboxMaker
    | IVideoMaker;

type BaseGraphicMaker = {
    scale: number;
    complete: () => void;
};

export type ICurveMaker = BaseGraphicMaker & {
    readonly target: ICurveRenderer;
    anchorListeners: (anchor: CurveAnchor) => {
        setPoint: (event: SlideMouseEvent) => void;
        setHandles: (event: SlideMouseEvent) => void;
    };
};

export type IEllipseMaker = BaseGraphicMaker & {
    readonly target: IEllipseRenderer;
    resizeListener: () => (event: SlideMouseEvent) => void;
};

export type IImageMaker = BaseGraphicMaker & {
    readonly target: IImageRenderer;
    resizeListener: () => (event: SlideMouseEvent) => void;
};

export type IRectangleMaker = BaseGraphicMaker & {
    readonly target: IRectangleRenderer;
    resizeListener: () => (event: SlideMouseEvent) => void;
};

export type ITextboxMaker = BaseGraphicMaker & {
    readonly target: ITextboxRenderer;
    resizeListener: () => (event: SlideMouseEvent) => void;
};

export type IVideoMaker = BaseGraphicMaker & {
    readonly target: IVideoRenderer;
    resizeListener: () => (event: SlideMouseEvent) => void;
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

// TODO: Reconcile these types with GraphicMutatorBase
type BaseGraphicMutator<T extends GraphicMutableSerialized> = {
    scale: number;
    updateHelpers: () => void;
    focus: () => void;
    unfocus: () => void;
    initMove: (initialPosition: V) => (event: SlideMouseEvent) => T;
    endMove: () => void;
    initVertexMove: (role: VERTEX_ROLES) => (event: SlideMouseEvent) => T;
    endVertexMove: () => void;
    rotateListener: () => (event: SlideMouseEvent) => T;
};

export type ICurveMutator = BaseGraphicMutator<CurveMutableSerialized> & {
    readonly type: GRAPHIC_TYPES.CURVE;
    readonly target: ICurveRenderer;
    anchorListener: (index: number, role: CURVE_ANCHOR_ROLES) => (event: SlideMouseEvent) => CurveMutableSerialized;
    setRotation: (rotation: number) => void;
    setFillColor: (fillColor: string) => void;
    setStrokeColor: (strokeColor: string) => void;
    setStrokeWidth: (strokeWidth: number) => void;
};

export type IEllipseMutator = BaseGraphicMutator<EllipseMutableSerialized> & {
    readonly type: GRAPHIC_TYPES.ELLIPSE;
    readonly target: IEllipseRenderer;
    setX: (x: number) => void;
    setY: (y: number) => void;
    setWidth: (width: number) => void;
    setHeight: (height: number) => void;
    setRotation: (rotation: number) => void;
    setFillColor: (fillColor: string) => void;
    setStrokeColor: (strokeColor: string) => void;
    setStrokeWidth: (strokeWidth: number) => void;
};

export type IImageMutator = BaseGraphicMutator<ImageMutableSerialized> & {
    readonly type: GRAPHIC_TYPES.IMAGE;
    readonly target: IImageRenderer;
    setX: (x: number) => void;
    setY: (y: number) => void;
    setWidth: (width: number) => void;
    setHeight: (height: number) => void;
    setRotation: (rotation: number) => void;
};

export type IRectangleMutator = BaseGraphicMutator<RectangleMutableSerialized> & {
    readonly type: GRAPHIC_TYPES.RECTANGLE;
    readonly target: IRectangleRenderer;
    setX: (x: number) => void;
    setY: (y: number) => void;
    setWidth: (width: number) => void;
    setHeight: (height: number) => void;
    setRotation: (rotation: number) => void;
    setFillColor: (fillColor: string) => void;
    setStrokeColor: (strokeColor: string) => void;
    setStrokeWidth: (strokeWidth: number) => void;
};

export type ITextboxMutator = BaseGraphicMutator<TextboxMutableSerialized> & {
    readonly type: GRAPHIC_TYPES.TEXTBOX;
    readonly target: ITextboxRenderer;
    setX: (x: number) => void;
    setY: (y: number) => void;
    setWidth: (width: number) => void;
    setHeight: (height: number) => void;
    setText: (text: string) => void;
    setRotation: (rotation: number) => void;
};

export type IVideoMutator = BaseGraphicMutator<VideoMutableSerialized> & {
    readonly type: GRAPHIC_TYPES.VIDEO;
    readonly target: IVideoRenderer;
    setX: (x: number) => void;
    setY: (y: number) => void;
    setWidth: (width: number) => void;
    setHeight: (height: number) => void;
    setRotation: (rotation: number) => void;
    setStrokeColor: (strokeColor: string) => void;
    setStrokeWidth: (strokeWidth: number) => void;
};

export type ISlideRenderer = {
    readonly canvas: SVG.Doc;
    readonly rawViewbox: Viewbox;
    readonly zoom: number;
    readonly bounds: { origin: V; dimensions: V };
    cursor: string;
    cursorLock: boolean;
    lockCursor: (cursor: string) => void;
    unlockCursor: (cursor?: string) => void;
    getSnapVectors: (exclude: string[]) => SnapVector[];
    makeCurveInteractive: (initialPosition: V) => ICurveMaker;
    makeEllipseInteractive: (initialPosition: V) => IEllipseMaker;
    makeImageInteractive: (initialPosition: V, source: string, dimensions: V) => IImageMaker;
    makeRectangleInteractive: (initialPosition: V) => IRectangleMaker;
    makeTextboxInteractive: (initialPosition: V) => ITextboxMaker;
    makeVideoInteractive: (initialPosition: V, source: string, dimension: V) => IVideoMaker;
    completeInteractiveMake: (graphicId: string) => void;
    getGraphic: (graphicId: string) => IGraphicRenderer;
    getGraphics: () => { [key: string]: IGraphicRenderer };
    setGraphic: (graphic: IGraphicRenderer) => void;
    removeGraphic: (graphicId: string) => void;
    focusGraphic: (graphicId: string) => IGraphicMutator;
    unfocusGraphic: (graphicId: string) => void;
    unfocusAllGraphics: (exclude?: string[]) => void;
    isFocused: (graphicId: string) => boolean;
    markGraphic: (graphicId: string) => IGraphicMarker;
    unmarkGraphic: (graphicId: string) => void;
    isMarked: (graphicId: string) => boolean;
    broadcastSetGraphic: (graphic: IGraphicRenderer) => void;
    broadcastRemoveGraphic: (graphicId: string) => void;
    setProps: (graphicId: string, graphicType: GRAPHIC_TYPES, props: GraphicMutableSerialized, emit?: boolean) => void;
    setX: (graphicId: string, x: number) => void;
    setY: (graphicId: string, y: number) => void;
    setFillColor: (graphicId: string, fillColor: string) => void;
    setStrokeColor: (graphicId: string, strokeColor: string) => void;
    setStrokeWidth: (graphicId: string, strokeWidth: number) => void;
    setWidth: (graphicId: string, width: number) => void;
    setHeight: (graphicId: string, height: number) => void;
    setRotation: (graphicId: string, rotation: number) => void;
    setText: (graphicId: string, text: string) => void;
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
