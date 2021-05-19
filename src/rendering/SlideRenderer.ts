import { dispatch, listen } from '@/events';
import { decorateSlideEvents } from '@/events/decorators';
import {
    GraphicCreatedPayload,
    GraphicDeletedPayload,
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
    CurveCreator,
    EllipseCreator,
    ImageCreator,
    RectangleCreator,
    TextboxCreator,
    VideoCreator
} from './creators';
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

    protected cursorLock = false;
    protected graphics: Keyed<IGraphicRenderer>;
    protected graphicsFocused: Keyed<IGraphicMutator>;
    protected graphicsInMaking: Keyed<IGraphicMaker>;
    protected graphicsHighlighted: Keyed<IGraphicMarker>;
    protected snapVectors: SnapVector[];

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
        this.graphics = {};
        this.graphicsFocused = {};
        this.graphicsInMaking = {};
        this.graphicsHighlighted = {};
        this.slideId = slideId;
        this.snapVectors = [
            new SnapVector(new V(croppedViewbox.width / 2, 0), V.east),
            new SnapVector(new V(croppedViewbox.width, croppedViewbox.height / 2), V.north),
            new SnapVector(new V(croppedViewbox.width / 2, croppedViewbox.height), V.west),
            new SnapVector(new V(0, croppedViewbox.height / 2), V.south),
            new SnapVector(new V(croppedViewbox.width / 2, croppedViewbox.height / 2), V.north),
            new SnapVector(new V(croppedViewbox.width / 2, croppedViewbox.height / 2), V.east)
        ];

        this.setCursor('default');
        initRendererEventBus(this);
        this._renderBackdrop(new V(croppedViewbox.width, croppedViewbox.height));
        decorateSlideEvents(this);
        this.canvas.node.tabIndex = 0;

        Object.values((graphics ?? {})).map(graphic => this.createGraphic(graphic));

        listen(SLIDE_EVENTS.ZOOM, 'onSlideZoom', (event: SlideZoomEvent): void => this._setZoom(event.detail.zoom));
        listen(SLIDE_EVENTS.KEYDOWN, 'onSlideKeydown', (event: SlideKeyboardEvent): void => {
            if (['Backspace', 'Delete'].indexOf(event.detail.baseEvent.key) !== -1) {
                Object.keys(this.graphicsFocused).forEach(graphicId => this.removeGraphic(graphicId));
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
     * Sets the slide cursor.
     */
    public setCursor(cursor: string): void {
        if (this.cursorLock) {
            return;
        }

        this.canvas.node.style.cursor = cursor;
    }

    /**
     * Sets the slide cursor and locks it so subsequent calls to lockCursor and setCursor will be ignored.
     * Unlock the slide cursor by calling unlockCursor.
     */
    public lockCursor(cursor: string): void {
        this.setCursor(cursor);
        this.cursorLock = true;
    }

    /**
     * Unlocks the slide cursor, accepting an optional cursor to immediately revert to.
     */
    public unlockCursor(cursor?: string): void {
        this.cursorLock = false;
        if (cursor) {
            this.setCursor(cursor);
        }
    }

    public getSnapVectors(exclude: string[]): SnapVector[] {
        return [
            ...this.snapVectors,
            ...Object.values(this.graphics)
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

        this.graphics[graphic.id] = graphic;
        return graphic;
    }

    public initInteractiveCreate(graphicId: string, graphicType: GRAPHIC_TYPES): IGraphicMaker {
        const props = { slide: this, scale: 1 / this.zoom, graphicId };
        let creator: IGraphicMaker | undefined;

        if (graphicType === GRAPHIC_TYPES.CURVE) {
            creator = new CurveCreator(props);
        } else if (graphicType === GRAPHIC_TYPES.ELLIPSE) {
            creator = new EllipseCreator(props);
        } else if (graphicType === GRAPHIC_TYPES.IMAGE) {
            creator = new ImageCreator(props);
        } else if (graphicType === GRAPHIC_TYPES.RECTANGLE) {
            creator = new RectangleCreator(props);
        } else if (graphicType === GRAPHIC_TYPES.TEXTBOX) {
            creator = new TextboxCreator(props);
        } else if (graphicType === GRAPHIC_TYPES.VIDEO) {
            creator = new VideoCreator(props);
        } else {
            throw new Error(`Could not initialize interactive create session for unknown graphic type: ${graphicType}`);
        }

        this.graphicsInMaking[graphicId] = creator;
        return creator;
    }

    public endInteractiveCreate(graphicId: string): void {
        delete this.graphicsInMaking[graphicId];
    }

    public getGraphic(graphicId: string): IGraphicRenderer {
        return this.graphics[graphicId];
    }

    public removeGraphic(graphicId: string, emit = true): void {
        // Technically, this should always happen since a graphic cannot be deleted without being focued
        if (this.isFocused(graphicId)) {
            this.unfocusGraphic(graphicId, emit);
        }

        // Technically, this should never happen since a graphic cannot be deleted without being focused
        if (this.isMarked(graphicId)) {
            this.unmarkGraphic(graphicId);
        }

        this.graphics[graphicId].unrender();
        delete this.graphics[graphicId];

        if (emit) {
            dispatch<GraphicDeletedPayload>(GRAPHIC_EVENT_CODES.DELETED, {
                publisherId: this.eventPublisherId,
                graphicId,
                slideId: this.slideId
            });
        }
    }

    public focusGraphic(graphicId: string, emit = true): IGraphicMutator {
        if (this.isFocused(graphicId)) {
            return this.graphicsFocused[graphicId];
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

        this.graphicsFocused[graphicId] = mutator;

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
        this.isFocused(graphicId) && this.graphicsFocused[graphicId].unfocus();
        delete this.graphicsFocused[graphicId];

        if (emit) {
            dispatch<GraphicUnfocusedPayload>(GRAPHIC_EVENT_CODES.UNFOCUSED, {
                publisherId: this.eventPublisherId,
                slideId: this.slideId,
                graphicId
            });
        }
    }

    public unfocusAllGraphics(exclude: string[] = []): void {
        Object.keys(this.graphicsFocused)
            .filter(graphicId => exclude.indexOf(graphicId) === -1)
            .forEach(graphicId => this.unfocusGraphic(graphicId));
    }

    public isFocused(graphicId: string): boolean {
        return this.graphicsFocused[graphicId] !== undefined;
    }

    public markGraphic(graphicId: string): IGraphicMarker {
        if (this.isMarked(graphicId)) {
            return this.graphicsHighlighted[graphicId];
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

        this.graphicsHighlighted[graphicId] = marker;
        return this.graphicsHighlighted[graphicId];
    }

    public unmarkGraphic(graphicId: string): void {
        this.graphicsHighlighted[graphicId] && this.graphicsHighlighted[graphicId].unmark();
        delete this.graphicsHighlighted[graphicId];
    }

    public isMarked(graphicId: string): boolean {
        return this.graphicsHighlighted[graphicId] !== undefined;
    }

    public setProps(graphicId: string, graphicType: GRAPHIC_TYPES, props: GraphicMutableSerialized, emit = true): void {
        const graphic = this.getGraphic(graphicId);
        if (graphic === undefined) {
            throw new Error(`Could not find graphic with id ${graphicId}`);
        }

        graphic.setProps(props);
        const mutator = this.graphicsFocused[graphicId];
        if (mutator !== undefined) {
            mutator.updateHelpers();
        }

        const makers = this.graphicsInMaking[graphicId];
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
        Object.values(this.graphicsFocused).forEach(mutator => (mutator.scale = 1 / this.zoom));
        Object.values(this.graphicsInMaking).forEach(maker => (maker.scale = 1 / this.zoom));
        Object.values(this.graphicsHighlighted).forEach(marker => (marker.scale = 1 / this.zoom));
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
