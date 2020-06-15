import * as SVG from 'svg.js';
import Vector from '../../models/Vector';
import { GRAPHIC_TYPES, GRAPHIC_ROLES } from '../constants';
import { GraphicRenderer } from '../types';

type RectangleRendererArgs = {
    id: string;
    canvas: SVG.Doc;
    role?: string;
    origin?: Vector;
    width?: number;
    height?: number;
    fillColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
    rotation?: number;
};

const DEFAULT_ARGS = {
    role: GRAPHIC_ROLES.STANDARD,
    origin: Vector.zero,
    width: 0,
    height: 0,
    fillColor: '#FFFFFF',
    strokeColor: '#000000',
    strokeWidth: 1,
    rotation: 0
};

class RectangleRenderer implements GraphicRenderer {
    private _id: string;
    private _canvas: SVG.Doc;
    private _svg: SVG.Rect | undefined;
    private _type: string;
    private _role: string;
    private _origin: Vector;
    private _width: number;
    private _height: number;
    private _fillColor: string;
    private _strokeColor: string;
    private _strokeWidth: number;
    private _rotation: number;

    constructor(args: RectangleRendererArgs) {
        this._id = args.id;
        this._canvas = args.canvas;
        this._type = GRAPHIC_TYPES.RECTANGLE;
        this._role = args.role || DEFAULT_ARGS.role;
        this._origin = args.origin || DEFAULT_ARGS.origin;
        this._width = args.width || DEFAULT_ARGS.width;
        this._height = args.height || DEFAULT_ARGS.height;
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

    public get role(): string {
        return this._role;
    }

    public get isRendered(): boolean {
        return this._svg !== undefined;
    }

    public set origin(origin: Vector) {
        // Update property
        this._origin = origin;

        // Update SVG if it exists
        this._svg?.rotate(0)
            .translate(this._origin.x, this._origin.y)
            .rotate(this._rotation);
    }

    public set width(width: number) {
        // Update property
        this._width = width;

        // Update SVG if it exists
        this._svg?.width(this._width);
    }

    public set height(height: number) {
        // Update property
        this._height = height;

        // Update SVG if it exists
        this._svg?.height(this._height);
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

        this._svg = this._canvas.rect(this._width, this._height)
            .translate(this._origin.x, this._origin.y)
            .fill(this._fillColor)
            .stroke({ color: this._strokeColor, width: this._strokeWidth })
            .rotate(this._rotation);
    }

    public unrender(): void {
        this._svg?.remove();
        this._svg = undefined;
    }

    public showFocus(): void {
    }

    public hideFocus(): void {
        
    }
}

export default RectangleRenderer;
