import { decorateRotateEvents } from '@/events/decorators/rotators';
import { radToDeg } from '@/utilities/utilities';
import Vector from '@/utilities/Vector';
import SVG from 'svg.js';
import SlideRenderer from '../SlideRenderer';
import { GRAPHIC_TYPES, IGraphicRenderer, IRotatorRenderer } from '../types';

type RotatorRendererArgs = {
    slide: SlideRenderer;
    scale: number;
    center: Vector;
    parent: IGraphicRenderer;
    rotation: number;
};

class RotatorRenderer implements IRotatorRenderer {
    public readonly type = GRAPHIC_TYPES.ROTATOR;
    private _slide: SlideRenderer;
    private _svg: SVG.Rect | undefined;
    private _parent: IGraphicRenderer;
    private _scale: number;
    private _width: number;
    private _height: number;
    private _center: Vector;
    private _fillColor: string;
    private _baseRotation = 45;
    private _rotation: number;

    constructor(args: RotatorRendererArgs) {
        this._slide = args.slide;
        this._parent = args.parent;
        this._scale = args.scale;
        this._center = args.center;
        this._width = 8;
        this._height = 8;
        this._fillColor = '#400c8b';
        this._rotation = args.rotation;
    }

    public get isRendered(): boolean {
        return this._svg !== undefined;
    }

    public get parent(): IGraphicRenderer {
        return this._parent;
    }

    public set center(center: Vector) {
        this._center = center;
        this._svg && this._svg.rotate(0)
            .translate(this._center.x - this._width * this._scale / 2, this._center.y - this._height * this._scale / 2)
            .rotate((this._baseRotation + radToDeg(this._rotation)) % 360);
    }

    public set scale(scale: number) {
        this._scale = scale;
        this._svg && this._svg.size(this._width * this._scale, this._height * this._scale);
    }

    public set rotation(rotation: number) {
        this._rotation = rotation;
        this._svg && this._svg.rotate((this._baseRotation + radToDeg(this._rotation)) % 360);
    }

    public render(): void {
        // Silently fail if the SVG is already rendered
        if (this.isRendered) {
            return;
        }

        this._svg = this._slide.canvas.rect(this._width * this._scale, this._height * this._scale)
            .translate(this._center.x - this._width * this._scale / 2, this._center.y - this._height * this._scale / 2)
            .fill(this._fillColor)
            .rotate((this._baseRotation + radToDeg(this._rotation)) % 360);
        decorateRotateEvents(this._svg, this._slide, this);
    }

    public unrender(): void {
        this._svg && this._svg.remove();
        this._svg = undefined;
    }
}

export default RotatorRenderer;
