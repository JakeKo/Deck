import Vector from '../utilities/Vector';
import { RectangleOutlineRenderer, RotatorRenderer, VertexRenderer } from './helpers';

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
    getType: () => GRAPHIC_TYPES;
    getTarget: () => GraphicRenderer;
    complete: () => void;
    setScale: (scale: number) => void;
};

export type BoundingBoxMutatorHelpers = {
    box: RectangleOutlineRenderer;
    vertices: { [key in VERTEX_ROLES]: VertexRenderer };
};

export type BoundingBox = {
    origin: Vector;
    center: Vector;
    dimensions: Vector;
};

export type CurveAnchor = {
    inHandle: Vector;
    point: Vector;
    outHandle: Vector;
};

export enum GRAPHIC_TYPES {
    CANVAS = 'canvas',
    CURVE = 'curve',
    CURVE_ANCHOR = 'curve-anchor',
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
