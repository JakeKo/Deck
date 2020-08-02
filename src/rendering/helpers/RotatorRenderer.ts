import * as SVG from 'svg.js';
import { provideId } from '../../utilities/IdProvider';
import Vector from '../../utilities/Vector';
import SlideRenderer from '../SlideRenderer';
import { GraphicRenderer, GRAPHIC_TYPES } from '../types';
import { decorateRotateEvents } from '../../events/decorators/rotators';

type RotatorRendererArgs = {
    slide: SlideRenderer;
    scale: number;
    center: Vector;
};

class RotatorRenderer implements GraphicRenderer {
    private _id: string;
    private _slide: SlideRenderer;
    private _svg: SVG.Ellipse | undefined;
    private _scale: number;
    private _width: number;
    private _height: number;
    private _center: Vector;
    private _fillColor: string;
    private _strokeColor: string;
    private _strokeWidth: number;

    constructor(args: RotatorRendererArgs) {
        this._id = provideId();
        this._slide = args.slide;
        this._scale = args.scale;
        this._center = args.center;
        this._width = 8;
        this._height = 8;
        this._fillColor = 'none';
        this._strokeColor = '#400c8b';
        this._strokeWidth = 1;
    }

    public getId(): string {
        return this._id;
    }

    public getType(): GRAPHIC_TYPES {
        return GRAPHIC_TYPES.ROTATOR;
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
            .stroke({ color: this._strokeColor, width: this._strokeWidth * this._scale });
        decorateRotateEvents(this._svg, this._slide, this);
    }

    public unrender(): void {
        this._svg && this._svg.remove();
        this._svg = undefined;
    }

    public setCenter(center: Vector): void {
        this._center = center;
        this._svg && this._svg.center(this._center.x, this._center.y);
    }

    public setScale(scale: number): void {
        this._scale = scale;
        this._svg && this._svg.size(this._width * this._scale, this._height * this._scale);
        this._svg && this._svg.stroke({ color: this._strokeColor, width: this._strokeWidth * this._scale });
    }
}

export default RotatorRenderer;
