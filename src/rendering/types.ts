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
    IMAGE = 'image',
    RECTANGLE = 'rectangle',
    TEXTBOX = 'textbox',
    VERTEX = 'vertex',
    VIDEO = 'video'
}
