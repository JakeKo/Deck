import * as SVG from 'svg.js';
import { GraphicRenderer, AnchorHandler } from "./types";
import Vector from '../models/Vector';
import AnchorRenderer from './AnchorRenderer';
import { GRAPHIC_TYPES, GRAPHIC_ROLES } from './constants';

type CurveRendererArgs = {
    id: string;
    canvas: SVG.Doc;
    role?: string;
    origin: Vector;
    points: Vector[];
    fillColor: string;
    strokeColor: string;
    strokeWidth: number;
    rotation: number;
};

type CurveAnchors = {
    initializeHandler: () => AnchorHandler;
    graphic: AnchorRenderer;
}[];

const DEFAULT_ARGS = {
    role: GRAPHIC_ROLES.STANDARD,
    origin: Vector.zero,
    points: [],
    fillColor: '#FFFFFF',
    strokeColor: '#000000',
    strokeWidth: 1,
    rotation: 0,
    anchors: []
};

class CurveRenderer implements GraphicRenderer {
    private _id: string;
    private _canvas: SVG.Doc;
    private _svg: SVG.Path | undefined;
    private _type: string;
    private _role: string;
    private _origin: Vector;
    private _points: Vector[];
    private _fillColor: string;
    private _strokeColor: string;
    private _strokeWidth: number;
    private _rotation: number;
    private _anchors: CurveAnchors;

    constructor(args: CurveRendererArgs) {
        this._id = args.id;
        this._canvas = args.canvas;
        this._type = GRAPHIC_TYPES.CURVE;
        this._role = args.role || DEFAULT_ARGS.role;
        this._origin = args.origin || DEFAULT_ARGS.origin;
        this._points = args.points || DEFAULT_ARGS.points;
        this._fillColor = args.fillColor || DEFAULT_ARGS.fillColor;
        this._strokeColor = args.strokeColor || DEFAULT_ARGS.strokeColor;
        this._strokeWidth = args.strokeWidth || DEFAULT_ARGS.strokeWidth;
        this._rotation = args.rotation || DEFAULT_ARGS.rotation;
        this._anchors = DEFAULT_ARGS.anchors;
    }

    public get id(): string {
        return this._id;
    }
    
    public get type(): string {
        return this._type;
    }
    
    public get role(): string {
        return this._role;
    }
    
    public get isRendered(): boolean {
        return this._svg !== undefined;
    }

    public set origin(origin: Vector) {
        // Update property
        const changeInOrigin = this._origin.towards(origin);
        this._origin = origin;
        this._points = this._points.map(point => point.add(changeInOrigin));

        // Update SVG if it exists
        this._svg !== undefined && this._svg.plot(this._formattedPoints)
            .rotate(0)
            .translate(this._origin.x, this._origin.y)
            .rotate(this._rotation);

        // Update anchors
        const allPoints = [ this._origin, ...this._points];
        this._anchors.forEach((anchor, i) => anchor.graphic.center = allPoints[i]);
    }
    
    // TODO: Figure out elegant method for adjusting curve points
    public set points(points: Vector[]) {
        // Update property
        this._points = points;

        // Update SVG if it exists

        // Update anchors
    }
    
    public set fillColor(fillColor: string) {
        // Update property
        this._fillColor = fillColor;

        // Update SVG if it exists
        this._svg !== undefined && this._svg.fill(this._fillColor);
    }
    
    public set strokeColor(strokeColor: string) {
        // Update property
        this._strokeColor = strokeColor;

        // Update SVG if it exists
        this._svg !== undefined && this._svg.stroke({ color: this._strokeColor, width: this._strokeWidth });
    }
    
    public set strokeWidth(strokeWidth: number) {
        // Update property
        this._strokeWidth = strokeWidth;

        // Update SVG if it exists
        this._svg !== undefined && this._svg.stroke({ color: this._strokeColor, width: this._strokeWidth });
    }
    
    public set rotation(rotation: number) {
        // Update property
        this._rotation = rotation;

        // Update SVG if it exists
        this._svg !== undefined && this._svg.rotate(this._rotation);
    }
    
    
    public render(): void {
        // Silently fail if the SVG was already rendered
        if (this.isRendered) return;

        this._svg = this._canvas.path(this._formattedPoints)
            .rotate(0)
            .translate(this._origin.x, this._origin.y)
            .fill(this._fillColor)
            .stroke({ color: this._strokeColor, width: this._strokeWidth })
            .rotate(this._rotation);
    }

    public unrender(): void {
        // Silently fail if the SVG was not rendered in the first place
        this._svg !== undefined && this._svg.remove();
        this._svg = undefined;
    }

    public showFocus(): void {
        this._anchors.forEach(anchor => anchor.graphic.render());
    }

    public hideFocus(): void {
        this._anchors.forEach(anchor => anchor.graphic.unrender());
    }

    // Reformat points from an array of objects to the bezier curve string
    // Note: Points are modeled as absolute positions but formatted as relative in the string
    private get _formattedPoints(): string {
        return `M 0,0 ${this._points.map(({ x, y }, i) => `${i % 3 === 0 ? ' C' : ''} ${x},${y}`)}`;
    }
}

export default CurveRenderer;
