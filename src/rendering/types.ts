import Vector from '../utilities/Vector';

export type GraphicRenderer = {
    getId: () => string;
    getType: () => GRAPHIC_TYPES;
    isRendered: () => boolean;
    render: () => void;
    unrender: () => void;
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
    getType: () => GRAPHIC_TYPES;
    getTarget: () => GraphicRenderer;
    complete: () => void;
    setScale: (scale: number) => void;
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
