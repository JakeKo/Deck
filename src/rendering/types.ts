import { SlideMouseEvent } from '@/events/types';
import { Viewbox } from '@/store/types';
import SnapVector from '@/utilities/SnapVector';
import Vector from '@/utilities/Vector';
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
    readonly pullPoints: Vector[];
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
};

export type IEllipseRenderer = BaseGraphicRenderer & {
    readonly type: GRAPHIC_TYPES.ELLIPSE;
    center: Vector;
    dimensions: Vector;
    fillColor: string;
    strokeColor: string;
    strokeWidth: number;
    setCenterAndDimensions: (center: Vector, dimensions: Vector) => void;
};

export type IImageRenderer = BaseGraphicRenderer & {
    readonly type: GRAPHIC_TYPES.IMAGE;
    readonly source: string;
    origin: Vector;
    dimensions: Vector;
    setOriginAndDimensions: (origin: Vector, dimensions: Vector) => void;
};

export type IRectangleRenderer = BaseGraphicRenderer & {
    readonly type: GRAPHIC_TYPES.RECTANGLE;
    origin: Vector;
    dimensions: Vector;
    fillColor: string;
    strokeColor: string;
    strokeWidth: number;
    setOriginAndDimensions: (origin: Vector, dimensions: Vector) => void;
};

export type ITextboxRenderer = BaseGraphicRenderer & {
    readonly type: GRAPHIC_TYPES.TEXTBOX;
    origin: Vector;
    dimensions: Vector;
    text: string;
    fontSize: number;
    fontWeight: string;
    typeface: string;
    setOriginAndDimensions: (origin: Vector, dimensions: Vector) => void;
};

export type IVideoRenderer = BaseGraphicRenderer & {
    readonly type: GRAPHIC_TYPES.VIDEO;
    readonly source: string;
    origin: Vector;
    dimensions: Vector;
    strokeColor: string;
    strokeWidth: number;
    setOriginAndDimensions: (origin: Vector, dimensions: Vector) => void;
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
    origin: Vector;
    dimensions: Vector;
    rotation: number;
    setOriginAndDimensions: (origin: Vector, dimensions: Vector) => void;
};

export type ICanvasRenderer = BaseHelperRenderer & {
    readonly type: GRAPHIC_TYPES.CANVAS;
};

export type ICurveAnchorRenderer = BaseHelperRenderer & {
    readonly type: GRAPHIC_TYPES.CURVE_ANCHOR;
    inHandle: Vector;
    point: Vector;
    outHandle: Vector;
};

export type ICurveOutlineRenderer = BaseHelperRenderer & {
    readonly type: GRAPHIC_TYPES.CURVE_OUTLINE;
};

export type IEllipseOutlineRenderer = BaseHelperRenderer & {
    readonly type: GRAPHIC_TYPES.ELLIPSE_OUTLINE;
    center: Vector;
    dimensions: Vector;
    setCenterAndDimensions: (center: Vector, dimensions: Vector) => void;
};

export type IRectangleOutlineRenderer = BaseHelperRenderer & {
    readonly type: GRAPHIC_TYPES.RECTANGLE_OUTLINE;
    origin: Vector;
    dimensions: Vector;
    setOriginAndDimensions: (origin: Vector, dimensions: Vector) => void;
};

export type IRotatorRenderer = BaseHelperRenderer & {
    readonly type: GRAPHIC_TYPES.ROTATOR;
    readonly parent: IGraphicRenderer;
    center: Vector;
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
    center: Vector;
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

type BaseGraphicMutator = {
    scale: number;
    vertexListener: (role: VERTEX_ROLES) => (event: SlideMouseEvent) => void;
    rotateListener: () => (event: SlideMouseEvent) => void;
    moveListener: (initialPosition: Vector, snapVectors: SnapVector[]) => (event: SlideMouseEvent) => void;
    complete: () => void;
};

export type ICurveMutator = BaseGraphicMutator & {
    readonly type: GRAPHIC_TYPES.CURVE;
    readonly target: ICurveRenderer;
    anchorListener: (index: number, role: CURVE_ANCHOR_ROLES) => (event: SlideMouseEvent) => void;
    setRotation: (rotation: number) => void;
    setFillColor: (fillColor: string) => void;
    setStrokeColor: (strokeColor: string) => void;
    setStrokeWidth: (strokeWidth: number) => void;
};

export type IEllipseMutator = BaseGraphicMutator & {
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

export type IImageMutator = BaseGraphicMutator & {
    readonly type: GRAPHIC_TYPES.IMAGE;
    readonly target: IImageRenderer;
    setX: (x: number) => void;
    setY: (y: number) => void;
    setWidth: (width: number) => void;
    setHeight: (height: number) => void;
    setRotation: (rotation: number) => void;
};

export type IRectangleMutator = BaseGraphicMutator & {
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

export type ITextboxMutator = BaseGraphicMutator & {
    readonly type: GRAPHIC_TYPES.TEXTBOX;
    readonly target: ITextboxRenderer;
    setX: (x: number) => void;
    setY: (y: number) => void;
    setWidth: (width: number) => void;
    setHeight: (height: number) => void;
    setRotation: (rotation: number) => void;
};

export type IVideoMutator = BaseGraphicMutator & {
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
    readonly bounds: { origin: Vector; dimensions: Vector };
    cursor: string;
    cursorLock: boolean;
    getSnapVectors: (exclude: string[]) => SnapVector[];
    renderSnapVectors: (snapVectors: { [key: string]: SnapVector }) => void;
    unrenderAllSnapVectors: () => void;
    makeCurveInteractive: (initialPosition: Vector) => ICurveMaker;
    makeEllipseInteractive: (initialPosition: Vector) => IEllipseMaker;
    makeImageInteractive: (initialPosition: Vector, source: string, dimensions: Vector) => IImageMaker;
    makeRectangleInteractive: (initialPosition: Vector) => IRectangleMaker;
    makeTextboxInteractive: (initialPosition: Vector) => ITextboxMaker;
    makeVideoInteractive: (initialPosition: Vector, source: string, dimension: Vector) => IVideoMaker;
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
    setX: (graphicId: string, x: number) => void;
    setY: (graphicId: string, y: number) => void;
    setFillColor: (graphicId: string, fillColor: string) => void;
    setStrokeColor: (graphicId: string, strokeColor: string) => void;
    setStrokeWidth: (graphicId: string, strokeWidth: number) => void;
    setWidth: (graphicId: string, width: number) => void;
    setHeight: (graphicId: string, height: number) => void;
    setRotation: (graphicId: string, rotation: number) => void;
};

export type BoundingBoxMutatorHelpers = {
    box: IBoxRenderer;
    rotator: IRotatorRenderer;
    vertices: { [key in VERTEX_ROLES]: IVertexRenderer };
};

export type BoundingBox = {
    origin: Vector;
    center: Vector;
    dimensions: Vector;
    topLeft: Vector;
    topRight: Vector;
    bottomLeft: Vector;
    bottomRight: Vector;
    rotation: number;
};

export type CurveAnchor = {
    inHandle: Vector;
    point: Vector;
    outHandle: Vector;
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
