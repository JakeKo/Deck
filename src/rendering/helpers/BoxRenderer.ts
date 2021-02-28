import { radToDeg } from '@/utilities/utilities';
import Vector from '@/utilities/Vector';
import SVG from 'svg.js';
import { GRAPHIC_TYPES, IBoxRenderer, ISlideRenderer } from '../types';

type BoxRendererArgs = {
    slide: ISlideRenderer;
    scale: number;
    origin: Vector;
    dimensions: Vector;
    rotation: number;
};

class BoxRenderer implements IBoxRenderer {
    public readonly type = GRAPHIC_TYPES.BOX;
    private _slide: ISlideRenderer;
    private _svg: SVG.Rect | undefined;
    private _origin: Vector;
    private _dimensions: Vector;
    private _scale: number;
    private _fillColor: string;
    private _strokeColor: string;
    private _strokeWidth: number;
    private _rotation: number;

    constructor(args: BoxRendererArgs) {
        this._slide = args.slide;
        this._scale = args.scale;
        this._origin = args.origin;
        this._dimensions = args.dimensions;
        this._fillColor = 'none';
        this._strokeColor = '#400c8b';
        this._strokeWidth = 1;
        this._rotation = args.rotation;
    }

    public get isRendered(): boolean {
        return this._svg !== undefined;
    }

    public set origin(origin: Vector) {
        this._origin = origin;
        this._svg && this._svg.rotate(0).translate(this._origin.x, this._origin.y).rotate(radToDeg(this._rotation));
    }

    public set dimensions(dimensions: Vector) {
        this._dimensions = dimensions;
        this._svg && this._svg.rotate(0).size(this._dimensions.x, this._dimensions.y).rotate(radToDeg(this._rotation));
    }

    public set scale(scale: number) {
        this._scale = scale;
        this._svg && this._svg.stroke({ color: this._strokeColor, width: this._strokeWidth * this._scale });
    }

    public set rotation(rotation: number) {
        this._rotation = rotation;
        this._svg && this._svg.rotate(radToDeg(this._rotation));
    }

    public setOriginAndDimensions(origin: Vector, dimensions: Vector): void {
        this._origin = origin;
        this._dimensions = dimensions;

        this._svg && this._svg
            .rotate(0)
            .translate(this._origin.x, this._origin.y)
            .size(this._dimensions.x, this._dimensions.y)
            .rotate(radToDeg(this._rotation));
    }

    public render(): void {
        // Silently fail if the SVG is already rendered
        if (this.isRendered) {
            return;
        }

        this._svg = this._slide.canvas.rect(this._dimensions.x, this._dimensions.y)
            .translate(this._origin.x, this._origin.y)
            .fill(this._fillColor)
            .stroke({ color: this._strokeColor, width: this._strokeWidth * this._scale })
            .rotate(radToDeg(this._rotation));
    }

    public unrender(): void {
        this._svg && this._svg.remove();
        this._svg = undefined;
    }
}

export default BoxRenderer;
