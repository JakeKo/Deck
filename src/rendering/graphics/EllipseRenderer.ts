import * as SVG from 'svg.js';
import { decorateEllipseEvents } from "../../events/decorators";
import Vector from "../../utilities/Vector";
import SlideRenderer from "../SlideRenderer";
import { GraphicRenderer, GRAPHIC_TYPES } from "../types";

type EllipseRendererArgs = {
    id: string;
    slide: SlideRenderer;
    center?: Vector;
    width?: number;
    height?: number;
    fillColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
    rotation?: number;
};

class EllipseRenderer implements GraphicRenderer {
    private _id: string;
    private _slide: SlideRenderer;
    private _svg: SVG.Ellipse | undefined;
    private _center: Vector;
    private _width: number;
    private _height: number;
    private _fillColor: string;
    private _strokeColor: string;
    private _strokeWidth: number;
    private _rotation: number;

    constructor(args: EllipseRendererArgs) {
        this._id = args.id;
        this._slide = args.slide;
        this._center = args.center || Vector.zero;
        this._width = args.width || 0;
        this._height = args.height || 0;
        this._fillColor = args.fillColor || '#CCCCCC';
        this._strokeColor = args.strokeColor || 'none';
        this._strokeWidth = args.strokeWidth || 0;
        this._rotation = args.rotation || 0;
    }

    public getId(): string {
        return this._id;
    }

    public getType(): GRAPHIC_TYPES {
        return GRAPHIC_TYPES.ELLIPSE;
    }

    public isRendered(): boolean {
        return this._svg !== undefined;
    }

    public render(): void {
        // Silently fail if the SVG is already rendered
        if (this.isRendered()) {
            return;
        }

        this._svg = this._slide.canvas.ellipse(this._width, this._height)
            .translate(this._center.x, this._center.y)
            .fill(this._fillColor)
            .stroke({ color: this._strokeColor, width: this._strokeWidth })
            .rotate(this._rotation);
        decorateEllipseEvents(this._svg, this._slide, this);
    }

    public unrender(): void {
        this._svg && this._svg.remove();
        this._svg = undefined;
    }

    public getCenter(): Vector {
        return this._center;
    }

    public setCenter(origin: Vector): void {
        this._center = origin;
        this._svg && this._svg.rotate(0).translate(this._center.x, this._center.y).rotate(this._rotation);
    }

    public getWidth(): number {
        return this._width;
    }

    public setWidth(width: number): void {
        this._width = width;
        this._svg && this._svg.width(this._width);
    }

    public getHeight(): number {
        return this._height;
    }

    public setHeight(height: number): void {
        this._height = height;
        this._svg && this._svg.height(this._height);
    }

    public getFillColor(): string {
        return this._fillColor;
    }

    public setFillColor(fillColor: string): void {
        this._fillColor = fillColor;
        this._svg && this._svg.fill(this._fillColor);
    }

    public getStrokeColor(): string {
        return this._strokeColor;
    }

    public setStrokeColor(strokeColor: string): void {
        this._strokeColor = strokeColor;
        this._svg && this._svg.stroke({ color: this._strokeColor, width: this._strokeWidth });
    }

    public getStrokeWidth(): number {
        return this._strokeWidth;
    }

    public setStrokeWidth(strokeWidth: number): void {
        this._strokeWidth = strokeWidth;
        this._svg && this._svg.stroke({ color: this._strokeColor, width: this._strokeWidth });
    }

    public getRotation(): number {
        return this._rotation;
    }

    public setRotation(rotation: number): void {
        this._rotation = rotation;
        this._svg && this._svg.rotate(this._rotation);
    }
}

export default EllipseRenderer;
