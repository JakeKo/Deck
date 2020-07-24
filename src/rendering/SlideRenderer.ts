import * as SVG from 'svg.js';
import { decorateSlideEvents } from '../events/decorators';
import { SlideZoomEvent, SLIDE_EVENTS } from '../events/types';
import { listen } from '../events/utilities';
import { Viewbox } from '../store/types';
import SlideStateManager from '../utilities/SlideStateManager';
import Vector from '../utilities/Vector';
import { CurveRenderer, RectangleRenderer, EllipseRenderer, ImageRenderer } from './graphics';
import { CurveMaker, EllipseMaker, ImageMaker, RectangleMaker, TextboxMaker, VideoMaker } from './makers';
import { CurveMutator, RectangleMutator, EllipseMutator, ImageMutator } from './mutators';
import { GraphicMaker, GraphicMutator, GraphicRenderer, GRAPHIC_TYPES } from './types';
import { renderBackdrop } from './utilities';

type SlideRendererArgs = {
    stateManager: SlideStateManager;
    canvas: SVG.Doc;
    rawViewbox: Viewbox;
    croppedViewbox: Viewbox;
    zoom: number;
};

class SlideRenderer {
    private _stateManager: SlideStateManager;
    private _canvas: SVG.Doc;
    private _graphics: { [index: string]: GraphicRenderer };
    private _rawViewbox: Viewbox;
    private _focusedGraphics: { [index: string]: GraphicMutator };
    private _activeMakers: { [index: string]: GraphicMaker };
    private _zoom: number;

    constructor(args: SlideRendererArgs) {
        this._stateManager = args.stateManager;
        this._canvas = args.canvas;
        this._graphics = {};
        this._rawViewbox = args.rawViewbox;
        this._focusedGraphics = {};
        this._activeMakers = {};
        this._zoom = args.zoom;

        renderBackdrop(this, args.croppedViewbox.width, args.croppedViewbox.height);
        decorateSlideEvents(this);
        this._canvas.node.tabIndex = 0;

        listen(SLIDE_EVENTS.ZOOM, (event: SlideZoomEvent): void => {
            this._zoom = event.detail.zoom;
            Object.values(this._focusedGraphics).forEach(mutator => mutator.setScale(1 / this._zoom));
            Object.values(this._activeMakers).forEach(maker => maker.setScale(1 / this._zoom));
        });
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

    public get zoom(): number {
        return this._zoom;
    }

    public get bounds(): { origin: Vector; height: number; width: number } {
        const bounds = this._canvas.node.getBoundingClientRect() as DOMRect;
        return { origin: new Vector(bounds.x, bounds.y), width: bounds.width, height: bounds.height };
    }

    public completeMaker(graphicId: string): void {
        delete this._activeMakers[graphicId];
    }

    public makeCurveInteractive(initialPosition: Vector): CurveMaker {
        return this.activateMaker(new CurveMaker({
            slide: this,
            initialPosition,
            scale: 1 / this._zoom
        }));
    }

    public makeEllipseInteractive(initialPosition: Vector): EllipseMaker {
        return this.activateMaker(new EllipseMaker({
            slide: this,
            initialPosition,
            scale: 1 / this._zoom
        }));
    }

    public makeImageInteractive(initialPosition: Vector, source: string, width: number, height: number) {
        return this.activateMaker(new ImageMaker({
            slide: this,
            initialPosition,
            source: source,
            width,
            height,
            scale: 1 / this._zoom
        }));
    }

    public makeRectangleInteractive(initialPosition: Vector): RectangleMaker {
        return this.activateMaker(new RectangleMaker({
            slide: this,
            initialPosition,
            scale: 1 / this._zoom
        }));
    }

    public makeTextboxInteractive(initialPosition: Vector): TextboxMaker {
        return this.activateMaker(new TextboxMaker({
            slide: this,
            initialPosition,
            scale: 1 / this._zoom
        }));
    }

    public makeVideoInteractive(initialPosition: Vector, source: HTMLVideoElement, width: number, height: number): VideoMaker {
        return this.activateMaker(new VideoMaker({
            slide: this,
            initialPosition,
            source,
            width,
            height,
            scale: 1 / this._zoom
        }));
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

        if (graphic.getType() === GRAPHIC_TYPES.CURVE) {
            mutator = new CurveMutator({ slide: this, scale: 1 / this._zoom, curve: graphic as CurveRenderer });
        } else if (graphic.getType() === GRAPHIC_TYPES.ELLIPSE) {
            mutator = new EllipseMutator({ slide: this, scale: 1 / this._zoom, ellipse: graphic as EllipseRenderer });
        } else if (graphic.getType() === GRAPHIC_TYPES.IMAGE) {
            mutator = new ImageMutator({ slide: this, scale: 1 / this._zoom, image: graphic as ImageRenderer });
        } else if (graphic.getType() === GRAPHIC_TYPES.RECTANGLE) {
            mutator = new RectangleMutator({ slide: this, scale: 1 / this._zoom, rectangle: graphic as RectangleRenderer });
        } else {
            throw new Error(`Cannot focus unrecognized graphic type: ${graphic.getType()}`);
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

    private activateMaker<T extends GraphicMaker>(maker: T): T {
        this._activeMakers[maker.getTarget().getId()] = maker;
        return maker;
    }
}

export default SlideRenderer;
