import * as SVG from 'svg.js';
import { Viewbox } from '../store/types';
import Vector from '../utilities/Vector';
import { GraphicRenderer } from './types';
import { decorateSlideEvents, renderBackdrop } from './utilities';
import { RectangleRenderer, CurveRenderer } from './graphics';

type SlideRendererArgs = {
    canvas: SVG.Doc;
    rawViewbox: Viewbox;
    croppedViewbox: Viewbox;
};

class SlideRenderer {
    private _canvas: SVG.Doc;
    private _graphics: { [index: string]: GraphicRenderer };
    private _rawViewbox: Viewbox;

    constructor(args: SlideRendererArgs) {
        this._canvas = args.canvas;
        this._graphics = {};
        this._rawViewbox = args.rawViewbox;

        renderBackdrop(this, args.croppedViewbox.width, args.croppedViewbox.height);
        decorateSlideEvents(this);
        this._canvas.node.tabIndex = 0;
    }

    public get canvas(): SVG.Doc {
        return this._canvas;
    }

    public set canvas(canvas: SVG.Doc) {
        this._canvas = canvas;
    }

    public get rawViewbox(): Viewbox {
        return this._rawViewbox;
    }

    public get bounds(): { origin: Vector, height: number, width: number } {
        const bounds = this._canvas.node.getBoundingClientRect() as DOMRect;
        return { origin: new Vector(bounds.x, bounds.y), width: bounds.width, height: bounds.height };
    }

    // Rectangle Methods
    public addRectangle(rectangle: RectangleRenderer): void {
        this._graphics[rectangle.getId()] = rectangle;
    }

    public updateRectangle(rectangle: RectangleRenderer): void {
        this._graphics[rectangle.getId()] = rectangle;
    }

    // Curve Methods
    public addCurve(curve: CurveRenderer): void {
        this._graphics[curve.getId()] = curve;
    }

    public updateCurve(curve: CurveRenderer): void {
        this._graphics[curve.getId()] = curve;
    }

    // Generic Graphic Methods
    public getGraphic(graphicId: string): GraphicRenderer {
        return this._graphics[graphicId];
    }

    public removeGraphic(graphicId: string): void {
        delete this._graphics[graphicId];
    }
}

export default SlideRenderer;
