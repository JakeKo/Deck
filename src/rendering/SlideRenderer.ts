import * as SVG from 'svg.js';
import Vector from '../utilities/Vector';
import { CanvasRenderer } from './helpers';
import { GraphicRenderer } from './types';
import { decorateSlideEvents } from './utilities';

type SlideRendererArgs = {
    canvas: SVG.Doc;
};

class SlideRenderer {
    private _canvas: SVG.Doc;
    private _graphics: { [index: string]: GraphicRenderer };

    constructor(args: SlideRendererArgs) {
        this._canvas = args.canvas;
        this._graphics = {};

        decorateSlideEvents(this);
        this._canvas.node.tabIndex = 0;
    }

    public get canvas(): SVG.Doc {
        return this._canvas;
    }

    public set canvas(canvas: SVG.Doc) {
        this._canvas = canvas;
    }

    public get bounds(): { origin: Vector, height: number, width: number } {
        const bounds = this._canvas.node.getBoundingClientRect() as DOMRect;
        return { origin: new Vector(bounds.x, bounds.y), width: bounds.width, height: bounds.height };
    }

    public renderBackdrop(width: number, height: number): void {
        new CanvasRenderer({
            canvas: this._canvas,
            origin: Vector.zero,
            width,
            height
        }).render();
    }

    public persistGraphic(graphic: GraphicRenderer): void {
        this._graphics[graphic.id] = graphic;
    }
}

export default SlideRenderer;
