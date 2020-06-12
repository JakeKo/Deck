import * as SVG from 'svg.js';
import Vector from '../models/Vector';
import { GRAPHIC_TYPES, GRAPHIC_ROLES } from '../constants';

type RectangleRendererArgs = {
    role: string | undefined;
    origin: Vector | undefined;
    width: number | undefined;
    height: number | undefined;
    fillColor: string | undefined;
    strokeColor: string | undefined;
    strokeWidth: number | undefined;
    rotation: number | undefined;
};

type RectangleAnchors = {
    topLeft: any,
    topRight: any,
    bottomRight: any,
    bottomLeft: any
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

class RectangleRenderer {
    private _svg: SVG.Rect | undefined;

    public type: string;
    public role: string;
    public origin: Vector;
    public width: number;
    public height: number;
    public fillColor: string;
    public strokeColor: string;
    public strokeWidth: number;
    public rotation: number;
    public anchors: RectangleAnchors;

    constructor(args: RectangleRendererArgs) {
        this.type = GRAPHIC_TYPES.RECTANGLE;
        this.role = args.role || DEFAULT_ARGS.role;
        this.origin = args.origin || DEFAULT_ARGS.origin;
        this.width = args.width || DEFAULT_ARGS.width;
        this.height = args.height || DEFAULT_ARGS.height;
        this.fillColor = args.fillColor || DEFAULT_ARGS.fillColor;
        this.strokeColor = args.strokeColor || DEFAULT_ARGS.strokeColor;
        this.strokeWidth = args.strokeWidth || DEFAULT_ARGS.strokeWidth;
        this.rotation = args.rotation || DEFAULT_ARGS.rotation;
        this.anchors = {
            topLeft: {},
            topRight: {},
            bottomRight: {},
            bottomLeft: {}
        };
    }

    public setOrigin(origin: Vector): void {
        this.origin = origin;
        this._svg !== undefined && this._svg.rotate(0);
        this._svg !== undefined && this._svg.translate(this.origin.x, this.origin.y);
        this._svg !== undefined && this._svg.rotate(this.rotation);
    }

    public setWidth(width: number): void {
        this.width = width;
        this._svg !== undefined && this._svg.width(this.width);
    }

    public setHeight(height: number): void {
        this.height = height;
        this._svg !== undefined && this._svg.height(this.height);
    }

    public setFillColor(fillColor: string): void {
        this.fillColor = fillColor;
        this._svg !== undefined && this._svg.fill(this.fillColor);
    }

    public setStrokeColor(strokeColor: string): void {
        this.strokeColor = strokeColor;
        this._svg !== undefined && this._svg.stroke({ color: this.strokeColor, width: this.strokeWidth });
    }

    public setStrokeWidth(strokeWidth: number): void {
        this.strokeWidth = strokeWidth;
        this._svg !== undefined && this._svg.stroke({ color: this.strokeColor, width: this.strokeWidth });
    }

    public setRotation(rotation: number): void {
        this.rotation = rotation;
        this._svg !== undefined && this._svg.rotate(this.rotation);
    }

    public render(canvas: SVG.Doc): void {
        this._svg = canvas.rect(this.width, this.height)
            .translate(this.origin.x, this.origin.y)
            .fill(this.fillColor)
            .stroke({ color: this.strokeColor, width: this.strokeWidth })
            .rotate(this.rotation);
    }

    public unrender(): void {
        // Silently fail if the SVG was not rendered in the first place
        this._svg !== undefined && this._svg.remove();
        this._svg = undefined;
    }
}

export default RectangleRenderer;
