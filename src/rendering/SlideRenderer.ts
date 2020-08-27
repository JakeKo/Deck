import { decorateSlideEvents } from '@/events/decorators';
import { SlideKeyboardEvent, SlideZoomEvent, SLIDE_EVENTS } from '@/events/types';
import { listen } from '@/events/utilities';
import { Viewbox } from '@/store/types';
import SlideStateManager from '@/utilities/SlideStateManager';
import Vector from '@/utilities/Vector';
import SVG from 'svg.js';
import { CurveMaker, EllipseMaker, ImageMaker, RectangleMaker, TextboxMaker, VideoMaker } from './makers';
import { CurveMarker, EllipseMarker, ImageMarker, RectangleMarker, TextboxMarker, VideoMarker } from './markers';
import { CurveMutator, EllipseMutator, ImageMutator, RectangleMutator, TextboxMutator, VideoMutator } from './mutators';
import { GRAPHIC_TYPES, ICurveMaker, IEllipseMaker, IGraphicMaker, IGraphicMarker, IGraphicMutator, IGraphicRenderer, IImageMaker, IRectangleMaker, ISlideRenderer, ITextboxMaker, IVideoMaker } from './types';
import { renderBackdrop } from './utilities';

type SlideRendererArgs = {
    stateManager: SlideStateManager;
    canvas: SVG.Doc;
    rawViewbox: Viewbox;
    croppedViewbox: Viewbox;
    zoom: number;
};

class SlideRenderer implements ISlideRenderer {
    public readonly canvas: SVG.Doc;
    public readonly rawViewbox: Viewbox;
    public zoom: number;
    private _stateManager: SlideStateManager;
    private _graphics: { [key: string]: IGraphicRenderer };
    private _focusedGraphics: { [key: string]: IGraphicMutator };
    private _activeMakers: { [key: string]: IGraphicMaker };
    private _markedGraphics: { [key: string]: IGraphicMarker };
    private _defaultCursor = 'default';
    private _cursor: string;
    private _cursorLock = false;

    constructor(args: SlideRendererArgs) {
        this.canvas = args.canvas;
        this.rawViewbox = args.rawViewbox;
        this._stateManager = args.stateManager;
        this._graphics = {};
        this._focusedGraphics = {};
        this._activeMakers = {};
        this._markedGraphics = {};
        this.zoom = args.zoom;
        this._cursor = this._defaultCursor;

        renderBackdrop(this, args.croppedViewbox.width, args.croppedViewbox.height);
        decorateSlideEvents(this);
        this.canvas.node.tabIndex = 0;

        listen(SLIDE_EVENTS.ZOOM, (event: SlideZoomEvent): void => {
            this.zoom = event.detail.zoom;
            Object.values(this._focusedGraphics).forEach(mutator => (mutator.scale = 1 / this.zoom));
            Object.values(this._activeMakers).forEach(maker => (maker.scale = 1 / this.zoom));
            Object.values(this._markedGraphics).forEach(marker => (marker.scale = 1 / this.zoom));
        });

        listen(SLIDE_EVENTS.KEYDOWN, (event: SlideKeyboardEvent): void => {
            if (['Backspace', 'Delete'].indexOf(event.detail.baseEvent.key) !== -1) {
                Object.keys(this._focusedGraphics).forEach(graphicId => this.removeGraphic(graphicId));
            }
        });
    }

    public get bounds(): { origin: Vector; dimensions: Vector } {
        const bounds = this.canvas.node.getBoundingClientRect() as DOMRect;
        return {
            origin: new Vector(bounds.x, bounds.y),
            dimensions: new Vector(bounds.width, bounds.height)
        };
    }

    public set cursor(cursor: string) {
        if (this._cursorLock) {
            return;
        }

        this._cursor = cursor;
        this.canvas.node.style.cursor = this._cursor;
    }

    public set cursorLock(cursorLock: boolean) {
        this._cursorLock = cursorLock;
    }

    public makeCurveInteractive(initialPosition: Vector): ICurveMaker {
        return this.activateMaker(new CurveMaker({
            slide: this,
            initialPosition,
            scale: 1 / this.zoom
        }));
    }

    public makeEllipseInteractive(initialPosition: Vector): IEllipseMaker {
        return this.activateMaker(new EllipseMaker({
            slide: this,
            initialPosition,
            scale: 1 / this.zoom
        }));
    }

    public makeImageInteractive(initialPosition: Vector, source: string, dimensions: Vector): IImageMaker {
        return this.activateMaker(new ImageMaker({
            slide: this,
            initialPosition,
            source,
            dimensions,
            scale: 1 / this.zoom
        }));
    }

    public makeRectangleInteractive(initialPosition: Vector): IRectangleMaker {
        return this.activateMaker(new RectangleMaker({
            slide: this,
            initialPosition,
            scale: 1 / this.zoom
        }));
    }

    public makeTextboxInteractive(initialPosition: Vector): ITextboxMaker {
        return this.activateMaker(new TextboxMaker({
            slide: this,
            initialPosition,
            scale: 1 / this.zoom
        }));
    }

    public makeVideoInteractive(initialPosition: Vector, source: HTMLVideoElement, dimensions: Vector): IVideoMaker {
        return this.activateMaker(new VideoMaker({
            slide: this,
            initialPosition,
            source,
            dimensions,
            scale: 1 / this.zoom
        }));
    }

    public completeInteractiveMake(graphicId: string): void {
        delete this._activeMakers[graphicId];
    }

    public getGraphic(graphicId: string): IGraphicRenderer {
        return this._graphics[graphicId];
    }

    public setGraphic(graphic: IGraphicRenderer): void {
        this._graphics[graphic.id] = graphic;
    }

    public removeGraphic(graphicId: string): void {
        // Technically, this should always happen since a graphic cannot be deleted without being focued
        if (this.isFocused(graphicId)) {
            this.unfocusGraphic(graphicId);
        }

        // Technically, this should never happen since a graphic cannot be deleted without being focused
        if (this.isMarked(graphicId)) {
            this.unmarkGraphic(graphicId);
        }

        this._graphics[graphicId].unrender();
        delete this._graphics[graphicId];
    }

    public broadcastSetGraphic(graphic: IGraphicRenderer): void {
        this._stateManager.setGraphicFromRenderer(graphic);
    }

    public broadcastRemoveGraphic(graphicId: string): void {
        this._stateManager.removeGraphicFromRenderer(graphicId);
    }

    public focusGraphic(graphicId: string): IGraphicMutator {
        if (this.isFocused(graphicId)) {
            return this._focusedGraphics[graphicId];
        }

        if (this.isMarked(graphicId)) {
            this.unmarkGraphic(graphicId);
        }

        const graphic = this.getGraphic(graphicId);
        let mutator;

        if (graphic.type === GRAPHIC_TYPES.CURVE) {
            mutator = new CurveMutator({ slide: this, scale: 1 / this.zoom, target: graphic });
        } else if (graphic.type === GRAPHIC_TYPES.ELLIPSE) {
            mutator = new EllipseMutator({ slide: this, scale: 1 / this.zoom, target: graphic });
        } else if (graphic.type === GRAPHIC_TYPES.IMAGE) {
            mutator = new ImageMutator({ slide: this, scale: 1 / this.zoom, target: graphic });
        } else if (graphic.type === GRAPHIC_TYPES.RECTANGLE) {
            mutator = new RectangleMutator({ slide: this, scale: 1 / this.zoom, target: graphic });
        } else if (graphic.type === GRAPHIC_TYPES.TEXTBOX) {
            mutator = new TextboxMutator({ slide: this, scale: 1 / this.zoom, target: graphic });
        } else if (graphic.type === GRAPHIC_TYPES.VIDEO) {
            mutator = new VideoMutator({ slide: this, scale: 1 / this.zoom, target: graphic });
        } else {
            throw new Error(`Cannot focus unrecognized graphic: ${graphic}`);
        }

        this._focusedGraphics[graphicId] = mutator;
        return mutator;
    }

    public unfocusGraphic(graphicId: string): void {
        this.isFocused(graphicId) && this._focusedGraphics[graphicId].complete();
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

    public markGraphic(graphicId: string): IGraphicMarker {
        if (this.isMarked(graphicId)) {
            return this._markedGraphics[graphicId];
        }

        const graphic = this.getGraphic(graphicId);
        let marker;

        if (graphic.type === GRAPHIC_TYPES.CURVE) {
            marker = new CurveMarker({ slide: this, scale: 1 / this.zoom, target: graphic });
        } else if (graphic.type === GRAPHIC_TYPES.ELLIPSE) {
            marker = new EllipseMarker({ slide: this, scale: 1 / this.zoom, target: graphic });
        } else if (graphic.type === GRAPHIC_TYPES.IMAGE) {
            marker = new ImageMarker({ slide: this, scale: 1 / this.zoom, target: graphic });
        } else if (graphic.type === GRAPHIC_TYPES.RECTANGLE) {
            marker = new RectangleMarker({ slide: this, scale: 1 / this.zoom, target: graphic });
        } else if (graphic.type === GRAPHIC_TYPES.TEXTBOX) {
            marker = new TextboxMarker({ slide: this, scale: 1 / this.zoom, target: graphic });
        } else if (graphic.type === GRAPHIC_TYPES.VIDEO) {
            marker = new VideoMarker({ slide: this, scale: 1 / this.zoom, target: graphic });
        } else {
            throw new Error(`Cannot focus unrecognized graphic: ${graphic}`);
        }

        this._markedGraphics[graphicId] = marker;
        return this._markedGraphics[graphicId];
    }

    public unmarkGraphic(graphicId: string): void {
        this._markedGraphics[graphicId] && this._markedGraphics[graphicId].unmark();
        delete this._markedGraphics[graphicId];
    }

    public isMarked(graphicId: string): boolean {
        return this._markedGraphics[graphicId] !== undefined;
    }

    private activateMaker<T extends IGraphicMaker>(maker: T): T {
        this._activeMakers[maker.target.id] = maker;
        return maker;
    }
}

export default SlideRenderer;
