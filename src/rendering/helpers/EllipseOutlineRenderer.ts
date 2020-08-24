import SVG from 'svg.js';
import Vector from '@/utilities/Vector';
import SlideRenderer from '../SlideRenderer';
import { GRAPHIC_TYPES, HelperRenderer } from '../types';
import { radToDeg } from '@/utilities/utilities';

type EllipseOutlineRendererArgs = {
    slide: SlideRenderer;
    scale: number;
    center: Vector;
    width: number;
    height: number;
    rotation: number;
};

class EllipseOutlineRenderer implements HelperRenderer {
    private _slide: SlideRenderer;
    private _svg: SVG.Ellipse | undefined;
    private _scale: number;
    private _width: number;
    private _height: number;
    private _center: Vector;
    private _fillColor: string;
    private _strokeColor: string;
    private _strokeWidth: number;
    private _rotation: number;

    constructor(args: EllipseOutlineRendererArgs) {
        this._slide = args.slide;
        this._scale = args.scale;
        this._center = args.center;
        this._width = args.width;
        this._height = args.height;
        this._fillColor = 'none';
        this._strokeColor = '#400c8b';
        this._strokeWidth = 1;
        this._rotation = args.rotation;
    }

    public getType(): GRAPHIC_TYPES {
        return GRAPHIC_TYPES.ELLIPSE_OUTLINE;
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
            .center(this._center.x, this._center.y)
            .fill(this._fillColor)
            .stroke({ color: this._strokeColor, width: this._strokeWidth * this._scale })
            .rotate(radToDeg(this._rotation));
    }

    public unrender(): void {
        this._svg && this._svg.remove();
        this._svg = undefined;
    }

    public setCenter(center: Vector): void {
        this._center = center;
        this._svg && this._svg.center(this._center.x, this._center.y);
    }

    public setWidth(width: number): void {
        this._width = width;
        this._svg && this._svg.width(this._width);
    }

    public setHeight(height: number): void {
        this._height = height;
        this._svg && this._svg.height(this._height);
    }

    public setScale(scale: number): void {
        this._scale = scale;
        this._svg && this._svg.size(this._width, this._height);
        this._svg && this._svg.stroke({ color: this._strokeColor, width: this._strokeWidth * this._scale });
    }
}

export default EllipseOutlineRenderer;
