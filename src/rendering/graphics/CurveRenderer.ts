import * as SVG from 'svg.js';
import { GraphicRenderer, CurveAnchor } from "../types";
import Vector from '../../models/Vector';
import { GRAPHIC_TYPES } from '../constants';

type CurveRendererArgs = {
    id: string;
    canvas: SVG.Doc;
    anchors: CurveAnchor[];
    fillColor: string;
    strokeColor: string;
    strokeWidth: number;
    rotation: number;
};

const DEFAULT_ARGS = {
    anchors: [],
    fillColor: '#FFFFFF',
    strokeColor: '#000000',
    strokeWidth: 1,
    rotation: 0
};

class CurveRenderer implements GraphicRenderer {
    private _id: string;
    private _canvas: SVG.Doc;
    private _svg: SVG.Path | undefined;
    private _type: string;
    private _anchors: CurveAnchor[];
    private _fillColor: string;
    private _strokeColor: string;
    private _strokeWidth: number;
    private _rotation: number;

    constructor(args: CurveRendererArgs) {
        this._id = args.id;
        this._canvas = args.canvas;
        this._type = GRAPHIC_TYPES.CURVE;
        this._anchors = args.anchors || DEFAULT_ARGS.anchors;
        this._fillColor = args.fillColor || DEFAULT_ARGS.fillColor;
        this._strokeColor = args.strokeColor || DEFAULT_ARGS.strokeColor;
        this._strokeWidth = args.strokeWidth || DEFAULT_ARGS.strokeWidth;
        this._rotation = args.rotation || DEFAULT_ARGS.rotation;
    }

    public get id(): string {
        return this._id;
    }
    
    public get type(): string {
        return this._type;
    }
    
    public get isRendered(): boolean {
        return this._svg !== undefined;
    }
    
    public set fillColor(fillColor: string) {
        // Update property
        this._fillColor = fillColor;

        // Update SVG if it exists
        this._svg?.fill(this._fillColor);
    }
    
    public set strokeColor(strokeColor: string) {
        // Update property
        this._strokeColor = strokeColor;

        // Update SVG if it exists
        this._svg?.stroke({
            color: this._strokeColor,
            width: this._strokeWidth
        });
    }
    
    public set strokeWidth(strokeWidth: number) {
        // Update property
        this._strokeWidth = strokeWidth;

        // Update SVG if it exists
        this._svg?.stroke({
            color: this._strokeColor,
            width: this._strokeWidth
        });
    }
    
    public set rotation(rotation: number) {
        // Update property
        this._rotation = rotation;

        // Update SVG if it exists
        this._svg?.rotate(this._rotation);
    }
    
    public render(): void {
        // Silently fail if the SVG is already rendered
        if (this.isRendered) {
            return;
        }

        this._svg = this._canvas.path(this._formattedPoints)
            .fill(this._fillColor)
            .stroke({ color: this._strokeColor, width: this._strokeWidth })
            .rotate(this._rotation);
    }

    public unrender(): void {
        this._svg?.remove();
        this._svg = undefined;
    }

    public move(origin: Vector) {
        // Update property
        const changeInPosition = this._anchors[0].point.towards(origin);
        this._anchors = this._anchors.map(anchor => ({
            inHandle: anchor.inHandle?.add(changeInPosition),
            point: anchor.point.add(changeInPosition),
            outHandle: anchor.outHandle?.add(changeInPosition)
        }));

        // Update SVG if it exists
        this._svg?.plot(this._formattedPoints);
    }

    public addAnchor(anchor: CurveAnchor): number {
        // Update property
        this._anchors.push(anchor);

        // Update SVG if it exists
        this._svg?.plot(this._formattedPoints);

        return this._anchors.length - 1;
    }

    public setAnchor(index: number, anchor: CurveAnchor): void {
        // Update property
        this._anchors[index] = anchor;

        // Update SVG if it exists
        this._svg?.plot(this._formattedPoints);
    }

    // Reformat points from an array of objects to the bezier curve string
    private get _formattedPoints(): string {
        const anchorPoints = this._anchors.map(s => [s.inHandle, s.point, s.outHandle].filter(p => p !== undefined) as Vector[]);
        const [origin, ...points] = anchorPoints.reduce((points, anchor) => [...points, ...anchor]);
        return `M ${origin.x},${origin.y} ${points.map(({ x, y }, i) => `${i % 3 === 0 ? ' C' : ''} ${x},${y}`)}`;
    }
}

export default CurveRenderer;
