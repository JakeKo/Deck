import { radToDeg } from '@/utilities/utilities';
import Vector from '@/utilities/Vector';
import SVG from 'svg.js';
import { GRAPHIC_TYPES, IEllipseOutlineRenderer, ISlideRenderer } from '../types';

type EllipseOutlineRendererArgs = {
    slide: ISlideRenderer;
    scale: number;
    center: Vector;
    dimensions: Vector;
    rotation: number;
};

class EllipseOutlineRenderer implements IEllipseOutlineRenderer {
    public readonly type = GRAPHIC_TYPES.ELLIPSE_OUTLINE;
    private _slide: ISlideRenderer;
    private _svg: SVG.Ellipse | undefined;
    private _scale: number;
    private _dimensions: Vector;
    private _center: Vector;
    private _fillColor: string;
    private _strokeColor: string;
    private _strokeWidth: number;
    private _rotation: number;

    constructor(args: EllipseOutlineRendererArgs) {
        this._slide = args.slide;
        this._scale = args.scale;
        this._center = args.center;
        this._dimensions = args.dimensions;
        this._fillColor = 'none';
        this._strokeColor = '#400c8b';
        this._strokeWidth = 1;
        this._rotation = args.rotation;
    }

    public get isRendered(): boolean {
        return this._svg !== undefined;
    }

    public set center(center: Vector) {
        this._center = center;
        this._svg && this._svg.center(this._center.x, this._center.y);
    }

    public set dimensions(dimensions: Vector) {
        this._dimensions = dimensions;
        this._svg && this._svg.size(this._dimensions.x, this._dimensions.y);
    }

    public set scale(scale: number) {
        this._scale = scale;
        this._svg && this._svg.stroke({ color: this._strokeColor, width: this._strokeWidth * this._scale });
    }

    public setCenterAndDimensions(center: Vector, dimensions: Vector): void {
        this._center = center;
        this._dimensions = dimensions;

        this._svg && this._svg
            .rotate(0)
            .center(this._center.x, this._center.y)
            .size(this._dimensions.x, this._dimensions.y)
            .rotate(radToDeg(this._rotation));
    }

    public render(): void {
        // Silently fail if the SVG is already rendered
        if (this.isRendered) {
            return;
        }

        this._svg = this._slide.canvas.ellipse(this._dimensions.x, this._dimensions.y)
            .center(this._center.x, this._center.y)
            .fill(this._fillColor)
            .stroke({ color: this._strokeColor, width: this._strokeWidth * this._scale })
            .rotate(radToDeg(this._rotation));
    }

    public unrender(): void {
        this._svg && this._svg.remove();
        this._svg = undefined;
    }
}

export default EllipseOutlineRenderer;
