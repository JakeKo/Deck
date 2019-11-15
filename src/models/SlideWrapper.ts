import * as SVG from 'svg.js';
import { IGraphic, CustomMouseEvent, ISlideWrapper, IRootState, CanvasMouseEvent, GraphicMouseEvent, CanvasKeyboardEvent, CustomCanvasMouseEvent, CustomGraphicMouseEvent } from '../types';
import Vector from './Vector';
import { Store } from 'vuex';
import { EVENT_TYPES } from '../constants';
import Utilities from '../utilities';
import Anchor from './graphics/Anchor';

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
    }

    private _forwardCanvasEvents(): void {
        const slideId: string = this.slideId;
        this._canvas.node.addEventListener('mouseover', (baseEvent: MouseEvent): void => {
            this.dispatchEventOnCanvas<CanvasMouseEvent>(EVENT_TYPES.CANVAS_MOUSE_OVER, { baseEvent, slideId });
        });

        this._canvas.node.addEventListener('mouseout', (baseEvent: MouseEvent): void => {
            this.dispatchEventOnCanvas<CanvasMouseEvent>(EVENT_TYPES.CANVAS_MOUSE_OUT, { baseEvent, slideId });
        });

        this._canvas.node.addEventListener('mouseup', (baseEvent: MouseEvent): void => {
            this.dispatchEventOnCanvas<CanvasMouseEvent>(EVENT_TYPES.CANVAS_MOUSE_UP, { baseEvent, slideId });
        });

        this._canvas.node.addEventListener('mousedown', (baseEvent: MouseEvent): void => {
            this.dispatchEventOnCanvas<CanvasMouseEvent>(EVENT_TYPES.CANVAS_MOUSE_DOWN, { baseEvent, slideId });
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

        this.addGraphicEventListener(graphicId, EVENT_TYPES.GRAPHIC_MOUSE_OVER, (event: CustomGraphicMouseEvent): void => {
            this.store.getters.tool.graphicMouseOver(this)(event);
        });

        this.addGraphicEventListener(graphicId, EVENT_TYPES.GRAPHIC_MOUSE_OUT, (event: CustomGraphicMouseEvent): void => {
            this.store.getters.tool.graphicMouseOut(this)(event);
        });

        this.addGraphicEventListener(graphicId, EVENT_TYPES.GRAPHIC_MOUSE_UP, (event: CustomGraphicMouseEvent): void => {
            this.store.getters.tool.graphicMouseUp(this)(event);
        });

        this.addGraphicEventListener(graphicId, EVENT_TYPES.GRAPHIC_MOUSE_DOWN, (event: CustomGraphicMouseEvent): void => {
            this.store.getters.tool.graphicMouseDown(this)(event);
        });

        this.addGraphicEventListener(graphicId, EVENT_TYPES.GRAPHIC_MOUSE_MOVE, (event: CustomGraphicMouseEvent): void => {
            this.store.getters.tool.graphicMouseMove(this)(event);
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
                this.addGraphic(anchor);
            });
        }
    }

    public setCursor(cursor: string): void {
        this._canvas.style('cursor', cursor);
    }

    public absoluteBounds(): DOMRect {
        return this._canvas.node.getBoundingClientRect() as DOMRect;
    }

    public getGraphic(graphicId: string): SVG.Element {
        const list: SVG.Set = this._canvas.select(`#graphic_${graphicId}`);

        if (list.length() === 0) {
            throw new Error(`No SVG with id ${graphicId} could be found.`);
        } else if (list.length() > 1) {
            throw new Error(`More than one SVG were found with the id ${graphicId}.`);
        }

        return list.first();
    }

    public addGraphic(graphic: IGraphic): void {
        const svg: SVG.Element = graphic.render(this._canvas);
        this._forwardGraphicEvents(graphic.id, svg);
    }

    public updateGraphic(id: string, newGraphic: IGraphic): void {
        const svg: SVG.Element = this.getGraphic(id);
        newGraphic.updateRendering(svg);
    }

    public removeGraphic(id: string): void {
        try {
            const svg: SVG.Element = this.getGraphic(id);
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
        this._canvas.node.removeEventListener(eventName, listener as EventListener);
    }

    public dispatchEventOnCanvas<T>(eventName: string, payload: T): void {
        this._canvas.node.dispatchEvent(new CustomEvent<T>(eventName, { detail: payload }));
    }

    public addGraphicEventListener(graphicId: string, eventName: string, listener: (event: CustomEvent) => void): void {
        this.getGraphic(graphicId).node.addEventListener(eventName, listener as EventListener);
    }

    public removeGraphicEventListener(graphicId: string, eventName: string, listener: (event: CustomEvent) => void): void {
        this.getGraphic(graphicId).node.removeEventListener(eventName, listener as EventListener);
    }

    public dispatchEventOnGraphic<T>(graphicId: string, eventName: string, payload: T): void {
        this.getGraphic(graphicId).node.dispatchEvent(new CustomEvent<T>(eventName, { detail: payload }));
    }
}
