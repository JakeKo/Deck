import Vector from '../models/Vector';
export type GraphicRenderer = {
    id: string;
    type: string;
    isRendered: boolean;
    render: () => void;
    unrender: () => void;
};

export type CurveAnchor = {
    inHandle: Vector | undefined;
    point: Vector;
    outHandle: Vector | undefined;
};
