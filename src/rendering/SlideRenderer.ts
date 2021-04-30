import { dispatch, listen } from '@/events';
import { decorateSlideEvents } from '@/events/decorators';
import {
    GraphicCreatedPayload,
    GraphicFocusedPayload,
    GraphicUnfocusedPayload,
    GraphicUpdatedPayload,
    GRAPHIC_EVENT_CODES,
    SlideKeyboardEvent,
    SlideZoomEvent,
    SLIDE_EVENTS
} from '@/events/types';
import { Viewbox } from '@/store/types';
import { GraphicMutableSerialized, GraphicSerialized, Keyed } from '@/types';
import SnapVector from '@/utilities/SnapVector';
import V from '@/utilities/Vector';
import SVG from 'svg.js';
import initRendererEventBus from './eventBus';
import { CurveRenderer, EllipseRenderer, ImageRenderer, RectangleRenderer, TextboxRenderer, VideoRenderer } from './graphics';
import { CanvasRenderer } from './helpers';
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
    IGraphicMaker,
    IGraphicMarker,
    IGraphicMutator,
    IGraphicRenderer,
    ISlideRenderer
} from './types';

const { CURVE, ELLIPSE, IMAGE, RECTANGLE, TEXTBOX, VIDEO } = GRAPHIC_TYPES;

class SlideRenderer implements ISlideRenderer {
    public readonly canvas: SVG.Doc;
    public readonly rawViewbox: Viewbox;
    public zoom: number;
    public eventPublisherId = 'renderer';
    public slideId: string;

    private _graphics: Keyed<IGraphicRenderer>;
    private _graphicsFocused: Keyed<IGraphicMutator>;
    private _graphicsMaking: Keyed<IGraphicMaker>;
    private _graphicsHighlighted: Keyed<IGraphicMarker>;
    private _defaultCursor = 'default';
    private _cursor: string;
    private _cursorLock = false;
    private _snapVectors: SnapVector[];

    constructor({
        canvas,
        rawViewbox,
        croppedViewbox,
        zoom,
        graphics,
        slideId
    }: {
        canvas: SVG.Doc;
        rawViewbox: Viewbox;
        croppedViewbox: Viewbox;
        zoom: number;
        graphics?: Keyed<GraphicSerialized>;
        slideId: string;
    }) {
        this.canvas = canvas;
        this.rawViewbox = rawViewbox;
        this.zoom = zoom;
        this._graphics = {};
        this._graphicsFocused = {};
        this._graphicsMaking = {};
        this._graphicsHighlighted = {};
        this._cursor = this._defaultCursor;
        this.slideId = slideId;
        this._snapVectors = [
            new SnapVector(new V(croppedViewbox.width / 2, 0), V.east),
            new SnapVector(new V(croppedViewbox.width, croppedViewbox.height / 2), V.north),
            new SnapVector(new V(croppedViewbox.width / 2, croppedViewbox.height), V.west),
            new SnapVector(new V(0, croppedViewbox.height / 2), V.south),
            new SnapVector(new V(croppedViewbox.width / 2, croppedViewbox.height / 2), V.north),
            new SnapVector(new V(croppedViewbox.width / 2, croppedViewbox.height / 2), V.east)
        ];

        initRendererEventBus(this);
        this._renderBackdrop(new V(croppedViewbox.width, croppedViewbox.height));
        decorateSlideEvents(this);
        this.canvas.node.tabIndex = 0;

        Object.values((graphics ?? {})).map(graphic => this.createGraphic(graphic));

        listen(SLIDE_EVENTS.ZOOM, 'onSlideZoom', (event: SlideZoomEvent): void => this._setZoom(event.detail.zoom));
        listen(SLIDE_EVENTS.KEYDOWN, 'onSlideKeydown', (event: SlideKeyboardEvent): void => {
            if (['Backspace', 'Delete'].indexOf(event.detail.baseEvent.key) !== -1) {
                this.removeGraphics(Object.keys(this._graphicsFocused));
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

    /**
     * @deprecated
     * @see lockCursor
     */
    public set cursor(cursor: string) {
        if (this._cursorLock) {
            return;
        }

        this._cursor = cursor;
        this.canvas.node.style.cursor = this._cursor;
    }

    /**
     * @deprecated
     * @see lockCursor
     */
    public set cursorLock(cursorLock: boolean) {
        this._cursorLock = cursorLock;
    }

    public lockCursor(cursor: string): void {
        this.cursor = cursor;
        this.cursorLock = true;
    }

    public unlockCursor(cursor?: string): void {
        this.cursorLock = false;
        if (cursor) {
            this.cursor = cursor;
        }
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

    public createGraphic(props: GraphicSerialized, render = true, emit = true): IGraphicRenderer {
        let graphic: IGraphicRenderer | undefined;

        if (props.type === GRAPHIC_TYPES.CURVE) {
            graphic = new CurveRenderer({
                ...props,
                slide: this,
                anchors: props.anchors.map(anchor => ({
                    inHandle: V.from(anchor.inHandle),
                    point: V.from(anchor.point),
                    outHandle: V.from(anchor.outHandle)
                }))
            });
        } else if (props.type === GRAPHIC_TYPES.ELLIPSE) {
            graphic = new EllipseRenderer({
                ...props,
                slide: this,
                center: V.from(props.center),
                dimensions: V.from(props.dimensions)
            });
        } else if (props.type === GRAPHIC_TYPES.IMAGE) {
            graphic = new ImageRenderer({
                ...props,
                slide: this,
                origin: V.from(props.origin),
                dimensions: V.from(props.dimensions)
            });
        } else if (props.type === GRAPHIC_TYPES.RECTANGLE) {
            graphic = new RectangleRenderer({
                ...props,
                slide: this,
                origin: V.from(props.origin),
                dimensions: V.from(props.dimensions)
            });
        } else if (props.type === GRAPHIC_TYPES.TEXTBOX) {
            graphic = new TextboxRenderer({
                ...props,
                slide: this,
                origin: V.from(props.origin),
                dimensions: V.from(props.dimensions)
            });
        } else if (props.type === GRAPHIC_TYPES.VIDEO) {
            graphic = new VideoRenderer({
                ...props,
                slide: this,
                origin: V.from(props.origin),
                dimensions: V.from(props.dimensions)
            });
        } else {
            throw new Error(`Tried to create a graphic of unknown type ${(props as { type: string}).type}`);
        }

        if (render) {
            graphic.render();
        }

        if (emit) {
            dispatch<GraphicCreatedPayload>(GRAPHIC_EVENT_CODES.CREATED, {
                publisherId: this.eventPublisherId,
                slideId: this.slideId,
                props
            });
        }

        this._graphics[graphic.id] = graphic;
        return graphic;
    }

    public initInteractiveCreate(graphicId: string, graphicType: GRAPHIC_TYPES): IGraphicMaker {
        const props = { slide: this, scale: 1 / this.zoom, graphicId };
        let creator: IGraphicMaker | undefined;

        if (graphicType === GRAPHIC_TYPES.CURVE) {
            creator = new CurveMaker(props);
        } else if (graphicType === GRAPHIC_TYPES.ELLIPSE) {
            creator = new EllipseMaker(props);
        } else if (graphicType === GRAPHIC_TYPES.IMAGE) {
            creator = new ImageMaker(props);
        } else if (graphicType === GRAPHIC_TYPES.RECTANGLE) {
            creator = new RectangleMaker(props);
        } else if (graphicType === GRAPHIC_TYPES.TEXTBOX) {
            creator = new TextboxMaker(props);
        } else if (graphicType === GRAPHIC_TYPES.VIDEO) {
            creator = new VideoMaker(props);
        } else {
            throw new Error(`Could not initialize interactive create session for unknown graphic type: ${graphicType}`);
        }

        this._graphicsMaking[graphicId] = creator;
        return creator;
    }

    public endInteractiveCreate(graphicId: string): void {
        delete this._graphicsMaking[graphicId];
    }

    public getGraphic(graphicId: string): IGraphicRenderer {
        return this._graphics[graphicId];
    }

    public getGraphics(): { [key: string]: IGraphicRenderer } {
        return this._graphics;
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

    public focusGraphic(graphicId: string, emit = true): IGraphicMutator {
        if (this.isFocused(graphicId)) {
            return this._graphicsFocused[graphicId];
        }

        if (this.isMarked(graphicId)) {
            this.unmarkGraphic(graphicId);
        }

        const graphic = this.getGraphic(graphicId);
        let mutator;

        if (graphic.type === CURVE) {
            mutator = new CurveMutator({ slide: this, scale: 1 / this.zoom, graphicId: graphic.id });
        } else if (graphic.type === ELLIPSE) {
            mutator = new EllipseMutator({ slide: this, scale: 1 / this.zoom, graphicId: graphic.id });
        } else if (graphic.type === IMAGE) {
            mutator = new ImageMutator({ slide: this, scale: 1 / this.zoom, graphicId: graphic.id });
        } else if (graphic.type === RECTANGLE) {
            mutator = new RectangleMutator({ slide: this, scale: 1 / this.zoom, graphicId: graphic.id });
        } else if (graphic.type === TEXTBOX) {
            mutator = new TextboxMutator({ slide: this, scale: 1 / this.zoom, graphicId: graphic.id });
        } else if (graphic.type === VIDEO) {
            mutator = new VideoMutator({ slide: this, scale: 1 / this.zoom, graphicId: graphic.id });
        } else {
            throw new Error(`Cannot focus unrecognized graphic: ${graphic}`);
        }

        this._graphicsFocused[graphicId] = mutator;

        if (emit) {
            dispatch<GraphicFocusedPayload>(GRAPHIC_EVENT_CODES.FOCUSED, {
                publisherId: this.eventPublisherId,
                slideId: this.slideId,
                graphicId
            });
        }

        return mutator;
    }

    public unfocusGraphic(graphicId: string, emit = true): void {
        this.isFocused(graphicId) && this._graphicsFocused[graphicId].unfocus();
        delete this._graphicsFocused[graphicId];

        if (emit) {
            dispatch<GraphicUnfocusedPayload>(GRAPHIC_EVENT_CODES.UNFOCUSED, {
                publisherId: this.eventPublisherId,
                slideId: this.slideId,
                graphicId
            });
        }
    }

    public unfocusAllGraphics(exclude: string[] = []): void {
        Object.keys(this._graphicsFocused)
            .filter(graphicId => exclude.indexOf(graphicId) === -1)
            .forEach(graphicId => this.unfocusGraphic(graphicId));
    }

    public isFocused(graphicId: string): boolean {
        return this._graphicsFocused[graphicId] !== undefined;
    }

    public markGraphic(graphicId: string): IGraphicMarker {
        if (this.isMarked(graphicId)) {
            return this._graphicsHighlighted[graphicId];
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

        this._graphicsHighlighted[graphicId] = marker;
        return this._graphicsHighlighted[graphicId];
    }

    public unmarkGraphic(graphicId: string): void {
        this._graphicsHighlighted[graphicId] && this._graphicsHighlighted[graphicId].unmark();
        delete this._graphicsHighlighted[graphicId];
    }

    public isMarked(graphicId: string): boolean {
        return this._graphicsHighlighted[graphicId] !== undefined;
    }

    public setProps(graphicId: string, graphicType: GRAPHIC_TYPES, props: GraphicMutableSerialized, emit = true): void {
        const graphic = this.getGraphic(graphicId);
        if (graphic === undefined) {
            throw new Error(`Could not find graphic with id ${graphicId}`);
        }

        graphic.setProps(props);
        const mutator = this._graphicsFocused[graphicId];
        if (mutator !== undefined) {
            mutator.updateHelpers();
        }

        const makers = this._graphicsMaking[graphicId];
        if (makers !== undefined) {
            makers.updateHelpers();
        }

        if (emit) {
            dispatch<GraphicUpdatedPayload>(GRAPHIC_EVENT_CODES.UPDATED, {
                publisherId: this.eventPublisherId,
                slideId: this.slideId,
                graphicType,
                graphicId,
                props
            });
        }
    }

    // When the zoom on the slide has changed, we need to correct for it so helpers don't shrink and grow
    private _setZoom(zoom: number): void {
        this.zoom = zoom;
        Object.values(this._graphicsFocused).forEach(mutator => (mutator.scale = 1 / this.zoom));
        Object.values(this._graphicsMaking).forEach(maker => (maker.scale = 1 / this.zoom));
        Object.values(this._graphicsHighlighted).forEach(marker => (marker.scale = 1 / this.zoom));
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
