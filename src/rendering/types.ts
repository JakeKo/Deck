import Vector from '../utilities/Vector';

export type GraphicRenderer = {
    id: string;
    type: string;
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
    CURVE = 'curve'
}
