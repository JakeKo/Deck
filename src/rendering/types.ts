import * as SVG from 'svg.js';
import Vector from '../models/Vector';

export type GraphicRenderer = {
    type: string;
    role: string;
    isRendered: boolean;
    render: (canvas: SVG.Doc) => void;
    unrender: () => void;
    showFocus: () => void;
    hideFocus: () => void;
};

export type AnchorHandler = (position: Vector) => void;

export type CurveAnchor = {
    inHandle: Vector | undefined;
    point: Vector;
    outHandle: Vector | undefined;
};
