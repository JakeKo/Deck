import * as SVG from 'svg.js';
import { IGraphic, CustomMouseEvent, ISlideWrapper, IRootState, CanvasMouseEvent, GraphicMouseEvent, Anchor, CanvasKeyboardEvent, CustomCanvasMouseEvent } from '../types';
import Vector from './Vector';
import { Store } from 'vuex';
import { EVENT_TYPES } from '../constants';
import Utilities from '../utilities';

export default class SlideWrapper implements ISlideWrapper {
    public store: Store<IRootState>;
    public slideId: string;
    public renderSupplementary: boolean;

    private _canvas: SVG.Doc;
    private _focusedGraphic: IGraphic | undefined;

    constructor(slideId: string, canvas: SVG.Doc, store: Store<IRootState>, renderSupplementary: boolean) {
        this.store = store;
        this.slideId = slideId;
        this.renderSupplementary = renderSupplementary;
        this._canvas = canvas;
        this._focusedGraphic = undefined;

        // Add a tab index so the canvas element can be focused, allowing events to be caught at the canvas level
        this._forwardCanvasEvents();
        this._canvas.node.tabIndex = 0;
        this._canvas.node.addEventListener('mousedown', (): void => this._canvas.node.focus());

        this.addCanvasEventListener(EVENT_TYPES.CANVAS_MOUSE_OVER, (event: CustomCanvasMouseEvent): void => {
            this.store.getters.tool.canvasMouseOver(this)(event);
        });

        this.addCanvasEventListener(EVENT_TYPES.CANVAS_MOUSE_OUT, (event: CustomCanvasMouseEvent): void => {
            this.store.getters.tool.canvasMouseOut(this)(event);
        });

        this.addCanvasEventListener(EVENT_TYPES.CANVAS_MOUSE_UP, (event: CustomCanvasMouseEvent): void => {
            this.store.getters.tool.canvasMouseUp(this)(event);
        });

        this.addCanvasEventListener(EVENT_TYPES.CANVAS_MOUSE_DOWN, (event: CustomCanvasMouseEvent): void => {
            this.store.getters.tool.canvasMouseDown(this)(event);
        });

        this.addCanvasEventListener(EVENT_TYPES.CANVAS_MOUSE_MOVE, (event: CustomCanvasMouseEvent): void => {
            this.store.getters.tool.canvasMouseMove(this)(event);
        });
    }

    private _forwardCanvasEvents(): void {
        const slideId: string = this.slideId;
        this._canvas.node.addEventListener('mouseup', (baseEvent: MouseEvent): void => {
            this.dispatchEventOnCanvas<CanvasMouseEvent>(EVENT_TYPES.CANVAS_MOUSE_UP, { baseEvent, slideId });
        });

        this._canvas.node.addEventListener('mousedown', (baseEvent: MouseEvent): void => {
            this.dispatchEventOnCanvas<CanvasMouseEvent>(EVENT_TYPES.CANVAS_MOUSE_DOWN, { baseEvent, slideId });
        });

        this._canvas.node.addEventListener('mouseover', (baseEvent: MouseEvent): void => {
            this.dispatchEventOnCanvas<CanvasMouseEvent>(EVENT_TYPES.CANVAS_MOUSE_OVER, { baseEvent, slideId });
        });

        this._canvas.node.addEventListener('mouseout', (baseEvent: MouseEvent): void => {
            this.dispatchEventOnCanvas<CanvasMouseEvent>(EVENT_TYPES.CANVAS_MOUSE_OUT, { baseEvent, slideId });
        });

        this._canvas.node.addEventListener('mousemove', (baseEvent: MouseEvent): void => {
            this.dispatchEventOnCanvas<CanvasMouseEvent>(EVENT_TYPES.CANVAS_MOUSE_MOVE, { baseEvent, slideId });
        });

        this._canvas.node.addEventListener('keydown', (baseEvent: KeyboardEvent): void => {
            this.dispatchEventOnCanvas<CanvasKeyboardEvent>(EVENT_TYPES.CANVAS_KEY_DOWN, { baseEvent, slideId });
        });

        this._canvas.node.addEventListener('keyup', (baseEvent: KeyboardEvent): void => {
            this.dispatchEventOnCanvas<CanvasKeyboardEvent>(EVENT_TYPES.CANVAS_KEY_UP, { baseEvent, slideId });
        });
    }

    private _forwardGraphicEvents(graphicId: string, svg: SVG.Element): void {
        const slideId: string = this.slideId;
        svg.node.addEventListener('mouseover', (baseEvent: MouseEvent): void => {
            this.dispatchEventOnGraphic<GraphicMouseEvent>(graphicId, EVENT_TYPES.GRAPHIC_MOUSE_OVER, { baseEvent, slideId, graphicId });
        });

        svg.node.addEventListener('mouseout', (baseEvent: MouseEvent): void => {
            this.dispatchEventOnGraphic<GraphicMouseEvent>(graphicId, EVENT_TYPES.GRAPHIC_MOUSE_OUT, { baseEvent, slideId, graphicId });
        });

        svg.node.addEventListener('mouseup', (baseEvent: MouseEvent): void => {
            this.dispatchEventOnGraphic<GraphicMouseEvent>(graphicId, EVENT_TYPES.GRAPHIC_MOUSE_UP, { baseEvent, slideId, graphicId });
        });

        svg.node.addEventListener('mousedown', (baseEvent: MouseEvent): void => {
            this.dispatchEventOnGraphic<GraphicMouseEvent>(graphicId, EVENT_TYPES.GRAPHIC_MOUSE_DOWN, { baseEvent, slideId, graphicId });
        });

        svg.node.addEventListener('mousemove', (baseEvent: MouseEvent): void => {
            this.dispatchEventOnGraphic<GraphicMouseEvent>(graphicId, EVENT_TYPES.GRAPHIC_MOUSE_MOVE, { baseEvent, slideId, graphicId });
        });
    }

    public focusGraphic(graphic: IGraphic | undefined) {
        // Unfocus the current graphic if there is one
        if (this._focusedGraphic !== undefined && this.renderSupplementary) {
            // Remove the anchor graphics
            this._focusedGraphic.anchorIds.forEach((anchorId: string): void => this.removeGraphic(anchorId));
        }

        this._focusedGraphic = graphic;
        if (this._focusedGraphic !== undefined && this.renderSupplementary) {

            // Render the anchor graphics
            const focusedGraphic: IGraphic = this._focusedGraphic;
            focusedGraphic.getAnchors(this).forEach((anchor: Anchor): void => {
                this.addGraphic(anchor.graphic);

                const anchorSvg: SVG.Element = this._canvas.select(`#graphic_${anchor.graphic.id}`).first();
                anchorSvg.on('mouseover', (): void => {
                    this.setCursor(anchor.cursor);
                });

                anchorSvg.on('mouseout', (): void => {
                    this.setCursor('default');
                });

                Utilities.bindAnchorMouseDown(this, anchor, focusedGraphic);
            });
        }
    }

    public setCursor(cursor: string): void {
        this._canvas.style('cursor', cursor);
    }

    public absoluteBounds(): DOMRect {
        return this._canvas.node.getBoundingClientRect() as DOMRect;
    }

    public getRenderedGraphic(id: string): SVG.Element {
        return this._canvas.select(`#graphic_${id}`).first();
    }

    public addGraphic(graphic: IGraphic): void {
        const svg: SVG.Element = graphic.render(this._canvas);
        this._forwardGraphicEvents(graphic.id, svg);

        if (graphic.defaultInteractive) {
            this.addGraphicEventListener(graphic.id, EVENT_TYPES.GRAPHIC_MOUSE_OVER, this.store.getters.tool.graphicMouseOver(this));
            this.addGraphicEventListener(graphic.id, EVENT_TYPES.GRAPHIC_MOUSE_OUT, this.store.getters.tool.graphicMouseOut(this));
            this.addGraphicEventListener(graphic.id, EVENT_TYPES.GRAPHIC_MOUSE_UP, this.store.getters.tool.graphicMouseUp(this));
            this.addGraphicEventListener(graphic.id, EVENT_TYPES.GRAPHIC_MOUSE_DOWN, this.store.getters.tool.graphicMouseDown(this));
            this.addGraphicEventListener(graphic.id, EVENT_TYPES.GRAPHIC_MOUSE_MOVE, this.store.getters.tool.graphicMouseMove(this));
        }
    }

    public updateGraphic(id: string, newGraphic: IGraphic): void {
        const svg: SVG.Element = this._getGraphic(id);
        newGraphic.updateRendering(svg);
    }

    public removeGraphic(id: string): void {
        try {
            const svg: SVG.Element = this._getGraphic(id);
            svg.remove();
        } catch {
            return;
        }
    }

    public getPosition(event: CustomMouseEvent): Vector {
        const bounds: DOMRect = this.absoluteBounds();
        const viewbox: { x: number, y: number, width: number, height: number } = this.store.getters.rawViewbox;

        return new Vector(event.detail.baseEvent.pageX, event.detail.baseEvent.pageY)
            .scale(1 / this.store.getters.canvasZoom)
            .add(new Vector(-bounds.x, -bounds.y))
            .add(new Vector(viewbox.x, viewbox.y))
            .transform(Math.round);
    }

    public addCanvasEventListener(eventName: string, listener: (event: CustomEvent) => void): void {
        this._canvas.node.addEventListener(eventName, listener as EventListener);
    }

    public removeCanvasEventListener(eventName: string, listener: (event: CustomEvent) => void): void {
        this._canvas.node.addEventListener(eventName, listener as EventListener);
    }

    public dispatchEventOnCanvas<T>(eventName: string, payload: T): void {
        this._canvas.node.dispatchEvent(new CustomEvent<T>(eventName, { detail: payload }));
    }

    public addGraphicEventListener(graphicId: string, eventName: string, listener: (event: CustomEvent) => void): void {
        this._getGraphic(graphicId).node.addEventListener(eventName, listener as EventListener);
    }

    public removeGraphicEventListener(graphicId: string, eventName: string, listener: (event: CustomEvent) => void): void {
        this._getGraphic(graphicId).node.addEventListener(eventName, listener as EventListener);
    }

    public dispatchEventOnGraphic<T>(graphicId: string, eventName: string, payload: T): void {
        this._getGraphic(graphicId).node.dispatchEvent(new CustomEvent<T>(eventName, payload));
    }

    private _getGraphic(graphicId: string): SVG.Element {
        const list: SVG.Set = this._canvas.select(`#graphic_${graphicId}`);

        if (list.length() === 0) {
            throw new Error(`No SVG with id ${graphicId} could be found.`);
        } else if (list.length() > 1) {
            throw new Error(`More than one SVG were found with the id ${graphicId}.`);
        }

        return list.first();
    }
}
