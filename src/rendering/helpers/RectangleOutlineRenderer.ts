import * as SVG from 'svg.js';
import Vector from '../../utilities/Vector';
import SlideRenderer from '../SlideRenderer';
import { GRAPHIC_TYPES, HelperRenderer } from '../types';

type RectangleOutlineRendererArgs = {
    slide: SlideRenderer;
    scale: number;
    origin: Vector;
    width: number;
    height: number;
};

class RectangleOutlineRenderer implements HelperRenderer {
    private _slide: SlideRenderer;
    private _svg: SVG.Rect | undefined;
    private _scale: number;
    private _width: number;
    private _height: number;
    private _origin: Vector;
    private _fillColor: string;
    private _strokeColor: string;
    private _strokeWidth: number;

    constructor(args: RectangleOutlineRendererArgs) {
        this._slide = args.slide;
        this._scale = args.scale;
        this._origin = args.origin;
        this._width = args.width;
        this._height = args.height;
        this._fillColor = 'none';
        this._strokeColor = '#400c8b';
        this._strokeWidth = 1;
    }

    public getType(): GRAPHIC_TYPES {
        return GRAPHIC_TYPES.RECTANGLE_OUTLINE;
    }

    public isRendered(): boolean {
        return this._svg !== undefined;
    }

    public render(): void {
        // Silently fail if the SVG is already rendered
        if (this.isRendered()) {
            return;
        }

        this._svg = this._slide.canvas.rect(this._width, this._height)
            .translate(this._origin.x, this._origin.y)
            .fill(this._fillColor)
            .stroke({ color: this._strokeColor, width: this._strokeWidth * this._scale });
    }

    public unrender(): void {
        this._svg && this._svg.remove();
        this._svg = undefined;
    }

    public setOrigin(origin: Vector): void {
        this._origin = origin;
        this._svg && this._svg.translate(this._origin.x, this._origin.y);
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

export default RectangleOutlineRenderer;
