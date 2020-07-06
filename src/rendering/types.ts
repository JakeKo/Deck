import Vector from '../utilities/Vector';

export type GraphicRenderer = {
    id: string;
    type: GRAPHIC_TYPES;
    isRendered: boolean;
    render: () => void;
    unrender: () => void;
};

export type CurveAnchor = {
    inHandle: Vector;
    point: Vector;
    outHandle: Vector;
};

export enum GRAPHIC_TYPES {
    RECTANGLE = 'rectangle',
    ELLIPSE = 'ellipse',
    CURVE = 'curve',
    CANVAS = 'canvas',
    CURVE_ANCHOR = 'curve-anchor',
    VERTEX = 'vertex'
}
