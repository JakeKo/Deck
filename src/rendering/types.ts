import { SlideMouseEvent } from '@/events/types';
import Vector from '@/utilities/Vector';
import { BoxRenderer, VertexRenderer, RotatorRenderer } from './helpers';

export type GraphicRenderer = {
    getId: () => string;
    getType: () => GRAPHIC_TYPES;
    isRendered: () => boolean;
    render: () => void;
    unrender: () => void;
    getRotation: () => number;
    setRotation: (rotation: number) => void;
    getBoundingBox: () => BoundingBox;
};

export type HelperRenderer = {
    getType: () => GRAPHIC_TYPES;
    isRendered: () => boolean;
    render: () => void;
    unrender: () => void;
    setScale: (scale: number) => void;
};

export type GraphicMaker = {
    getTarget: () => GraphicRenderer;
    complete: () => void;
    setScale: (scale: number) => void;
};

export type GraphicMarker = {
    unmark: () => void;
    setScale: (scale: number) => void;
};

export type GraphicMutator = {
    helpers: BoundingBoxMutatorHelpers;
    vertexListener: (role: VERTEX_ROLES) => (event: SlideMouseEvent) => void;
    rotateListener: () => (event: SlideMouseEvent) => void;
    moveListener: (initialPosition: Vector) => (event: SlideMouseEvent) => void;
    getType: () => GRAPHIC_TYPES;
    getTarget: () => GraphicRenderer;
    complete: () => void;
    setScale: (scale: number) => void;
};

export type BoundingBoxMutatorHelpers = {
    box: BoxRenderer;
    rotator: RotatorRenderer;
    vertices: { [key in VERTEX_ROLES]: VertexRenderer };
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
