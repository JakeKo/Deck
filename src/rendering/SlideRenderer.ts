import { listen } from '@/events';
import { decorateSlideEvents } from '@/events/decorators';
import { SlideKeyboardEvent, SlideZoomEvent, SLIDE_EVENTS } from '@/events/types';
import { GraphicStoreModel, Viewbox } from '@/store/types';
import { graphicStoreModelToGraphicRenderer } from '@/utilities/parsing/renderer';
import SlideStateManager from '@/utilities/SlideStateManager';
import SnapVector from '@/utilities/SnapVector';
import V from '@/utilities/Vector';
import SVG from 'svg.js';
import { CanvasRenderer } from './helpers';
import SnapVectorRenderer from './helpers/SnapVectorRenderer';
import {
    CurveMaker,
    EllipseMaker,
    ImageMaker,
    RectangleMaker,
    TextboxMaker,
    VideoMaker
} from './makers';
import {
    CurveMarker,
    EllipseMarker,
    ImageMarker,
    RectangleMarker,
    TextboxMarker,
    VideoMarker
} from './markers';
import {
    CurveMutator,
    EllipseMutator,
    ImageMutator,
    RectangleMutator,
    TextboxMutator,
    VideoMutator
} from './mutators';
import {
    GRAPHIC_TYPES,
    ICurveMaker,
    IEllipseMaker,
    IGraphicMaker,
    IGraphicMarker,
    IGraphicMutator,
    IGraphicRenderer,
    IImageMaker,
    IRectangleMaker,
    ISlideRenderer,
    ITextboxMaker,
    IVideoMaker
} from './types';

const { CURVE, ELLIPSE, IMAGE, RECTANGLE, TEXTBOX, VIDEO } = GRAPHIC_TYPES;

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
    private _snapVectors: SnapVector[];
    private _renderedSnapVectors: { [key: string]: SnapVectorRenderer };

    constructor(args: {
        stateManager: SlideStateManager;
        canvas: SVG.Doc;
        rawViewbox: Viewbox;
        croppedViewbox: Viewbox;
        zoom: number;
        graphics?: { [key: string]: GraphicStoreModel };
    }) {
        this.canvas = args.canvas;
        this.rawViewbox = args.rawViewbox;
        this.zoom = args.zoom;
        this._stateManager = args.stateManager;
        this._focusedGraphics = {};
        this._activeMakers = {};
        this._markedGraphics = {};
        this._cursor = this._defaultCursor;
        this._snapVectors = [
            new SnapVector(new V(args.croppedViewbox.width / 2, 0), V.east),
            new SnapVector(new V(args.croppedViewbox.width, args.croppedViewbox.height / 2), V.north),
            new SnapVector(new V(args.croppedViewbox.width / 2, args.croppedViewbox.height), V.west),
            new SnapVector(new V(0, args.croppedViewbox.height / 2), V.south),
            new SnapVector(new V(args.croppedViewbox.width / 2, args.croppedViewbox.height / 2), V.north),
            new SnapVector(new V(args.croppedViewbox.width / 2, args.croppedViewbox.height / 2), V.east)
        ];
        this._renderedSnapVectors = {};

        this._renderBackdrop(new V(args.croppedViewbox.width, args.croppedViewbox.height));
        decorateSlideEvents(this);
        this.canvas.node.tabIndex = 0;

        this._graphics = args.graphics
            ? Object.values(args.graphics).map(graphic => graphicStoreModelToGraphicRenderer(graphic, this))
                .reduce((graphics, graphic) => ({ [graphic.id]: graphic, ...graphics }), {})
            : {};
        Object.values(this._graphics).forEach(graphic => graphic.render());

        listen(SLIDE_EVENTS.ZOOM, 'onSlideZoom', (event: SlideZoomEvent): void => this._setZoom(event.detail.zoom));
        listen(SLIDE_EVENTS.KEYDOWN, 'onSlideKeydown', (event: SlideKeyboardEvent): void => {
            if (['Backspace', 'Delete'].indexOf(event.detail.baseEvent.key) !== -1) {
                this.removeGraphics(Object.keys(this._focusedGraphics));
            }
        });
    }

    public get bounds(): { origin: V; dimensions: V } {
        const bounds = this.canvas.node.getBoundingClientRect() as DOMRect;
        return {
            origin: new V(bounds.x, bounds.y),
            dimensions: new V(bounds.width, bounds.height)
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

    public getSnapVectors(exclude: string[]): SnapVector[] {
        return [
            ...this._snapVectors,
            ...Object.values(this._graphics)
                .filter(g => !exclude.includes(g.id))
                .map(g => [...g.staticSnapVectors, ...g.transformedSnapVectors])
                .reduce((all, some) => [...all, ...some], [])
        ];
    }

    public renderSnapVectors(snapVectors: { [key: string]: SnapVector }): void {
        Object.keys(snapVectors).forEach(key => {
            if (this._renderedSnapVectors[key] === undefined) {
                const renderer = new SnapVectorRenderer({ slide: this, snapVector: snapVectors[key], scale: 1 / this.zoom });
                renderer.render();
                this._renderedSnapVectors[key] = renderer;
            } else {
                this._renderedSnapVectors[key].snapVector = snapVectors[key];
            }
        });
    }

    public unrenderAllSnapVectors(): void {
        Object.values(this._renderedSnapVectors).forEach(renderer => renderer.unrender());
        this._renderedSnapVectors = {};
    }

    public makeCurveInteractive(initialPosition: V): ICurveMaker {
        return this._activateMaker(new CurveMaker({
            slide: this,
            initialPosition,
            scale: 1 / this.zoom
        }));
    }

    public makeEllipseInteractive(initialPosition: V): IEllipseMaker {
        return this._activateMaker(new EllipseMaker({
            slide: this,
            initialPosition,
            scale: 1 / this.zoom
        }));
    }

    public makeImageInteractive(initialPosition: V, source: string, dimensions: V): IImageMaker {
        return this._activateMaker(new ImageMaker({
            slide: this,
            initialPosition,
            source,
            dimensions,
            scale: 1 / this.zoom
        }));
    }

    public makeRectangleInteractive(initialPosition: V): IRectangleMaker {
        return this._activateMaker(new RectangleMaker({
            slide: this,
            initialPosition,
            scale: 1 / this.zoom
        }));
    }

    public makeTextboxInteractive(initialPosition: V): ITextboxMaker {
        return this._activateMaker(new TextboxMaker({
            slide: this,
            initialPosition,
            scale: 1 / this.zoom
        }));
    }

    public makeVideoInteractive(initialPosition: V, source: string, dimensions: V): IVideoMaker {
        return this._activateMaker(new VideoMaker({
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

    public getGraphics(): { [key: string]: IGraphicRenderer } {
        return this._graphics;
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

    public removeGraphics(graphicIds: string[]): void {
        graphicIds.forEach(graphicId => this.removeGraphic(graphicId));
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

        if (graphic.type === CURVE) {
            mutator = new CurveMutator({ slide: this, scale: 1 / this.zoom, target: graphic, graphicId: graphic.id });
        } else if (graphic.type === ELLIPSE) {
            mutator = new EllipseMutator({ slide: this, scale: 1 / this.zoom, target: graphic, graphicId: graphic.id });
        } else if (graphic.type === IMAGE) {
            mutator = new ImageMutator({ slide: this, scale: 1 / this.zoom, target: graphic, graphicId: graphic.id });
        } else if (graphic.type === RECTANGLE) {
            mutator = new RectangleMutator({ slide: this, scale: 1 / this.zoom, target: graphic, graphicId: graphic.id });
        } else if (graphic.type === TEXTBOX) {
            mutator = new TextboxMutator({ slide: this, scale: 1 / this.zoom, target: graphic, graphicId: graphic.id });
        } else if (graphic.type === VIDEO) {
            mutator = new VideoMutator({ slide: this, scale: 1 / this.zoom, target: graphic, graphicId: graphic.id });
        } else {
            throw new Error(`Cannot focus unrecognized graphic: ${graphic}`);
        }

        this._focusedGraphics[graphicId] = mutator;
        this._stateManager.focusGraphicFromRenderer(graphicId);
        return mutator;
    }

    public unfocusGraphic(graphicId: string): void {
        this.isFocused(graphicId) && this._focusedGraphics[graphicId].complete();
        this._stateManager.unfocusGraphicFromRenderer(graphicId);
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

        if (graphic.type === CURVE) {
            marker = new CurveMarker({ slide: this, scale: 1 / this.zoom, target: graphic });
        } else if (graphic.type === ELLIPSE) {
            marker = new EllipseMarker({ slide: this, scale: 1 / this.zoom, target: graphic });
        } else if (graphic.type === IMAGE) {
            marker = new ImageMarker({ slide: this, scale: 1 / this.zoom, target: graphic });
        } else if (graphic.type === RECTANGLE) {
            marker = new RectangleMarker({ slide: this, scale: 1 / this.zoom, target: graphic });
        } else if (graphic.type === TEXTBOX) {
            marker = new TextboxMarker({ slide: this, scale: 1 / this.zoom, target: graphic });
        } else if (graphic.type === VIDEO) {
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

    // SINGLE PROPERTY UPDATE METHODS
    public setX(graphicId: string, x: number): void {
        const graphic = this.getGraphic(graphicId);
        if (graphic.type === IMAGE || graphic.type === RECTANGLE || graphic.type === TEXTBOX || graphic.type === VIDEO) {
            if (this.isFocused(graphicId)) {
                (this._focusedGraphics[graphicId] as ImageMutator | RectangleMutator | TextboxMutator | VideoMutator).setX(x);
            } else {
                graphic.origin = new V(x, graphic.origin.y);
            }
        } else if (graphic.type === ELLIPSE) {
            if (this.isFocused(graphicId)) {
                (this._focusedGraphics[graphicId] as EllipseMutator).setX(x);
            } else {
                graphic.center = new V(x, graphic.center.y);
            }
        } else {
            console.warn(`Attempted to set property 'x' of graphic with type '${graphic.type}'`);
        }
    }

    public setY(graphicId: string, y: number): void {
        const graphic = this.getGraphic(graphicId);
        if (graphic.type === IMAGE || graphic.type === RECTANGLE || graphic.type === TEXTBOX || graphic.type === VIDEO) {
            if (this.isFocused(graphicId)) {
                (this._focusedGraphics[graphicId] as ImageMutator | RectangleMutator | TextboxMutator | VideoMutator).setY(y);
            } else {
                graphic.origin = new V(graphic.origin.x, y);
            }
        } else if (graphic.type === ELLIPSE) {
            if (this.isFocused(graphicId)) {
                (this._focusedGraphics[graphicId] as EllipseMutator).setY(y);
            } else {
                graphic.center = new V(graphic.center.x, y);
            }
        } else {
            console.warn(`Attempted to set property 'y' of graphic with type '${graphic.type}'`);
        }
    }

    public setFillColor(graphicId: string, fillColor: string): void {
        const graphic = this.getGraphic(graphicId);
        if (graphic.type === CURVE || graphic.type === ELLIPSE || graphic.type === RECTANGLE) {
            if (this.isFocused(graphicId)) {
                (this._focusedGraphics[graphicId] as CurveMutator | EllipseMutator | RectangleMutator).setFillColor(fillColor);
            } else {
                graphic.fillColor = fillColor;
            }
        } else {
            console.warn(`Attempted to set property 'fillColor' of graphic with type '${graphic.type}'`);
        }
    }

    public setStrokeColor(graphicId: string, strokeColor: string): void {
        const graphic = this.getGraphic(graphicId);
        if (graphic.type === CURVE || graphic.type === ELLIPSE || graphic.type === RECTANGLE || graphic.type === VIDEO) {
            if (this.isFocused(graphicId)) {
                (this._focusedGraphics[graphicId] as CurveMutator | EllipseMutator | RectangleMutator | VideoMutator).setStrokeColor(strokeColor);
            } else {
                graphic.strokeColor = strokeColor;
            }
        } else {
            console.warn(`Attempted to set property 'strokeColor' of graphic with type '${graphic.type}'`);
        }
    }

    public setStrokeWidth(graphicId: string, strokeWidth: number): void {
        const graphic = this.getGraphic(graphicId);
        if (graphic.type === CURVE || graphic.type === ELLIPSE || graphic.type === RECTANGLE || graphic.type === VIDEO) {
            if (this.isFocused(graphicId)) {
                (this._focusedGraphics[graphicId] as CurveMutator | EllipseMutator | RectangleMutator | VideoMutator).setStrokeWidth(strokeWidth);
            } else {
                graphic.strokeWidth = strokeWidth;
            }
        } else {
            console.warn(`Attempted to set property 'strokeWidth' of graphic with type '${graphic.type}'`);
        }
    }

    public setWidth(graphicId: string, width: number): void {
        const graphic = this.getGraphic(graphicId);
        if (graphic.type === ELLIPSE || graphic.type === IMAGE || graphic.type === RECTANGLE || graphic.type === TEXTBOX || graphic.type === VIDEO) {
            if (this.isFocused(graphicId)) {
                (this._focusedGraphics[graphicId] as EllipseMutator | ImageMutator | RectangleMutator | TextboxMutator | VideoMutator).setWidth(width);
            } else {
                graphic.dimensions = new V(width, graphic.dimensions.y);
            }
        } else {
            console.warn(`Attempted to set property 'width' of graphic with type '${graphic.type}'`);
        }
    }

    public setHeight(graphicId: string, height: number): void {
        const graphic = this.getGraphic(graphicId);
        if (graphic.type === ELLIPSE || graphic.type === IMAGE || graphic.type === RECTANGLE || graphic.type === TEXTBOX || graphic.type === VIDEO) {
            if (this.isFocused(graphicId)) {
                (this._focusedGraphics[graphicId] as EllipseMutator | ImageMutator | RectangleMutator | TextboxMutator | VideoMutator).setHeight(height);
            } else {
                graphic.dimensions = new V(graphic.dimensions.x, height);
            }
        } else {
            console.warn(`Attempted to set property 'height' of graphic with type '${graphic.type}'`);
        }
    }

    public setRotation(graphicId: string, rotation: number): void {
        const graphic = this.getGraphic(graphicId);
        if (this.isFocused(graphicId)) {
            this._focusedGraphics[graphicId].setRotation(rotation);
        } else {
            graphic.rotation = rotation;
        }
    }

    public setText(graphicId: string, text: string): void {
        const graphic = this.getGraphic(graphicId);
        if (graphic.type === TEXTBOX) {
            if (this.isFocused(graphicId)) {
                (this._focusedGraphics[graphicId] as TextboxMutator).setText(text);
            } else {
                graphic.text = text;
            }
        } else {
            console.warn(`Attempted to set property 'height' of graphic with type '${graphic.type}'`);
        }
    }

    private _activateMaker<T extends IGraphicMaker>(maker: T): T {
        this._activeMakers[maker.target.id] = maker;
        return maker;
    }

    // When the zoom on the slide has changed, we need to correct for it so helpers don't shrink and grow
    private _setZoom(zoom: number): void {
        this.zoom = zoom;
        Object.values(this._focusedGraphics).forEach(mutator => (mutator.scale = 1 / this.zoom));
        Object.values(this._activeMakers).forEach(maker => (maker.scale = 1 / this.zoom));
        Object.values(this._markedGraphics).forEach(marker => (marker.scale = 1 / this.zoom));
        Object.values(this._renderedSnapVectors).forEach(snapVector => (snapVector.scale = 1 / this.zoom));
    }

    private _renderBackdrop(dimensions: V): void {
        new CanvasRenderer({
            slide: this,
            origin: V.zero,
            dimensions
        }).render();
    }
}

export default SlideRenderer;
