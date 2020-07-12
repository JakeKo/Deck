import * as SVG from 'svg.js';
import { Viewbox } from '../store/types';
import SlideStateManager from '../utilities/SlideStateManager';
import Vector from '../utilities/Vector';
import { GraphicRenderer } from './types';
import { decorateSlideEvents, renderBackdrop } from './utilities';

type SlideRendererArgs = {
    stateManager: SlideStateManager;
    canvas: SVG.Doc;
    rawViewbox: Viewbox;
    croppedViewbox: Viewbox;
};

class SlideRenderer {
    private _stateManager: SlideStateManager;
    private _canvas: SVG.Doc;
    private _graphics: { [index: string]: GraphicRenderer };
    private _rawViewbox: Viewbox;

    constructor(args: SlideRendererArgs) {
        this._stateManager = args.stateManager;
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

    public getGraphic(graphicId: string): GraphicRenderer {
        return this._graphics[graphicId];
    }

    public setGraphic(graphic: GraphicRenderer): void {
        this._graphics[graphic.getId()] = graphic;
    }

    public removeGraphic(graphicId: string): void {
        delete this._graphics[graphicId];
    }

    public broadcastSetGraphic(graphic: GraphicRenderer): void {
        this._stateManager.setGraphicFromRenderer(graphic);
    }

    public broadcastRemoveGraphic(graphicId: string): void {
        this._stateManager.removeGraphicFromRenderer(graphicId);
    }
}

export default SlideRenderer;
