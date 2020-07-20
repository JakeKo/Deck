import * as SVG from 'svg.js';
import { decorateSlideEvents } from '../events/decorators';
import { Viewbox } from '../store/types';
import SlideStateManager from '../utilities/SlideStateManager';
import Vector from '../utilities/Vector';
import { CurveRenderer, RectangleRenderer } from './graphics';
import { CurveMaker, RectangleMaker } from './makers';
import { CurveMutator, RectangleMutator } from './mutators';
import { GraphicMutator, GraphicRenderer, GRAPHIC_TYPES } from './types';
import { renderBackdrop } from './utilities';

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
    private _focusedGraphics: { [index: string]: GraphicMutator };

    constructor(args: SlideRendererArgs) {
        this._stateManager = args.stateManager;
        this._canvas = args.canvas;
        this._graphics = {};
        this._rawViewbox = args.rawViewbox;
        this._focusedGraphics = {};

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

    public makeRectangleInteractive(initialPosition: Vector): RectangleMaker {
        return new RectangleMaker({ slide: this, initialPosition });
    }

    public makeCurveInteractive(initialPosition: Vector): CurveMaker {
        return new CurveMaker({ slide: this, initialPosition });
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

    public focusGraphic(graphicId: string): GraphicMutator {
        if (this.isFocused(graphicId)) {
            return this._focusedGraphics[graphicId];
        }

        const graphic = this.getGraphic(graphicId);
        let mutator;

        if (graphic.getType() === GRAPHIC_TYPES.RECTANGLE) {
            mutator = new RectangleMutator({ slide: this, rectangle: graphic as RectangleRenderer });
        } else if (graphic.getType() === GRAPHIC_TYPES.CURVE) {
            mutator = new CurveMutator({ slide: this, curve: graphic as CurveRenderer });
        } else {
            throw new Error(`Did not recognize graphic type: ${graphic.getType()}`);
        }

        this._focusedGraphics[graphicId] = mutator;
        return mutator;
    }

    public unfocusGraphic(graphicId: string): void {
        this._focusedGraphics[graphicId].complete();
        delete this._focusedGraphics[graphicId];
    }

    public unfocusAllGraphics(exclude: string[] = []): void {
        Object.keys(this._focusedGraphics)
            .filter(graphicId => exclude.indexOf(graphicId) === -1)
            .forEach(graphicId => this.unfocusGraphic(graphicId));
    }

    public isFocused(graphicId: string): boolean {
        return this._focusedGraphics[graphicId] !== undefined;
    }

    public setCursor(cursor: string): void {
        this._canvas.node.style.cursor = cursor;
    }
}

export default SlideRenderer;
