import * as SVG from 'svg.js';
import { decorateRotateEvents } from '../../events/decorators/rotators';
import Vector from '../../utilities/Vector';
import SlideRenderer from '../SlideRenderer';
import { GraphicRenderer, GRAPHIC_TYPES, HelperRenderer } from '../types';

type RotatorRendererArgs = {
    slide: SlideRenderer;
    scale: number;
    center: Vector;
    parent: GraphicRenderer;
};

class RotatorRenderer implements HelperRenderer {
    private _slide: SlideRenderer;
    private _svg: SVG.Rect | undefined;
    private _parent: GraphicRenderer;
    private _scale: number;
    private _width: number;
    private _height: number;
    private _center: Vector;
    private _fillColor: string;
    private _rotation: number;

    constructor(args: RotatorRendererArgs) {
        this._slide = args.slide;
        this._parent = args.parent;
        this._scale = args.scale;
        this._center = args.center;
        this._width = 8;
        this._height = 8;
        this._fillColor = '#400c8b';
        this._rotation = 45;
    }

    public getType(): GRAPHIC_TYPES {
        return GRAPHIC_TYPES.ROTATOR;
    }

    public isRendered(): boolean {
        return this._svg !== undefined;
    }

    public getParent(): GraphicRenderer {
        return this._parent;
    }

    public render(): void {
        // Silently fail if the SVG is already rendered
        if (this.isRendered()) {
            return;
        }

        this._svg = this._slide.canvas.rect(this._width * this._scale, this._height * this._scale)
            .translate(this._center.x - this._width * this._scale / 2, this._center.y - this._height * this._scale / 2)
            .fill(this._fillColor)
            .rotate(this._rotation);
        decorateRotateEvents(this._svg, this._slide, this);
    }

    public unrender(): void {
        this._svg && this._svg.remove();
        this._svg = undefined;
    }

    public setCenter(center: Vector): void {
        this._center = center;
        this._svg && this._svg.rotate(0)
            .translate(this._center.x - this._width * this._scale / 2, this._center.y - this._height * this._scale / 2)
            .rotate(this._rotation);
    }

    public setScale(scale: number): void {
        this._scale = scale;
        this._svg && this._svg.size(this._width * this._scale, this._height * this._scale)
            .rotate(0)
            .translate(this._center.x - this._width * this._scale / 2, this._center.y - this._height * this._scale / 2)
            .rotate(this._rotation);
    }
}

export default RotatorRenderer;
