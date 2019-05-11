import * as SVG from "svg.js";
import IGraphic from "../models/graphics/IGraphic";
import GraphicEvent from "../models/GraphicEvent";
import CanvasMouseEvent from "../models/CanvasMouseEvent";
import GraphicMouseEvent from "../models/GraphicMouseEvent";
import Anchor from "../models/Anchor";

export default class SlideWrapper {
    public store: any;
    public slideId: string;
    public renderSupplementary: boolean;

    private _canvas: SVG.Doc;
    private _focusedGraphic: IGraphic | undefined;

    constructor(slideId: string, canvas: SVG.Doc, store: any, renderSupplementary: boolean) {
        this.store = store;
        this.slideId = slideId;
        this.renderSupplementary = renderSupplementary;
        this._canvas = canvas;
        this._focusedGraphic = undefined;

        document.addEventListener("Deck.GraphicAdded", (event: Event): void => {
            // Check that the event pertains to the wrapper's specific slide
            const detail: GraphicEvent = (event as CustomEvent<GraphicEvent>).detail;
            if (detail.slideId === this.slideId && (detail.graphic !== undefined && (this.renderSupplementary || !detail.graphic!.supplementary))) {
                this.addGraphic(detail.graphic!);
            }
        });

        document.addEventListener("Deck.GraphicRemoved", (event: Event): void => {
            // Check that the event pertains to the wrapper's specific slide
            const detail: GraphicEvent = (event as CustomEvent<GraphicEvent>).detail;
            if (detail.slideId === this.slideId && (detail.graphic !== undefined && (this.renderSupplementary || !detail.graphic!.supplementary))) {
                this.removeGraphic(detail.graphicId!);
            }
        });

        document.addEventListener("Deck.GraphicUpdated", (event: Event): void => {
            // Check that the event pertains to the wrapper's specific slide
            const detail: any = (event as CustomEvent<GraphicEvent>).detail;
            if (detail.slideId === this.slideId && (detail.graphic !== undefined && (this.renderSupplementary || !detail.graphic!.supplementary))) {
                this.updateGraphic(detail.graphicId, detail.graphic);
            }
        });

        document.addEventListener("Deck.GraphicFocused", (event: Event): void => {
            // Check that the event pertains to the wrapper's specific slide
            const detail: any = (event as CustomEvent<GraphicEvent>).detail;
            if (detail.slideId === this.slideId && (detail.graphic !== undefined && (this.renderSupplementary || !detail.graphic!.supplementary))) {
                this.focusGraphic(detail.graphic);
            }
        });

        this._forwardCanvasEvents();
    }

    private _forwardCanvasEvents(): void {
        this._canvas.on("mousemove", (event: MouseEvent): void => {
            event.preventDefault();
            event.stopPropagation();
            document.dispatchEvent(new CustomEvent<CanvasMouseEvent>("Deck.CanvasMouseMove", { detail: new CanvasMouseEvent(event, this.slideId) }));
        });

        this._canvas.on("mouseover", (event: MouseEvent): void => {
            event.preventDefault();
            event.stopPropagation();
            document.dispatchEvent(new CustomEvent<CanvasMouseEvent>("Deck.CanvasMouseOver", { detail: new CanvasMouseEvent(event, this.slideId) }));
        });

        this._canvas.on("mouseout", (event: MouseEvent): void => {
            event.preventDefault();
            event.stopPropagation();
            document.dispatchEvent(new CustomEvent<CanvasMouseEvent>("Deck.CanvasMouseOut", { detail: new CanvasMouseEvent(event, this.slideId) }));
        });

        this._canvas.on("mouseup", (event: MouseEvent): void => {
            event.preventDefault();
            event.stopPropagation();
            document.dispatchEvent(new CustomEvent<CanvasMouseEvent>("Deck.CanvasMouseUp", { detail: new CanvasMouseEvent(event, this.slideId) }));
        });

        this._canvas.on("mousedown", (event: MouseEvent): void => {
            event.preventDefault();
            event.stopPropagation();
            document.dispatchEvent(new CustomEvent<CanvasMouseEvent>("Deck.CanvasMouseDown", { detail: new CanvasMouseEvent(event, this.slideId) }));
        });
    }

    private _forwardGraphicEvents(graphicId: string, svg: SVG.Element): void {
        svg.on("mouseover", (event: MouseEvent): void => {
            event.preventDefault();
            event.stopPropagation();
            document.dispatchEvent(new CustomEvent<GraphicMouseEvent>("Deck.GraphicMouseOver", { detail: new GraphicMouseEvent(event, this.slideId, graphicId) }));
        });

        svg.on("mouseout", (event: MouseEvent): void => {
            event.preventDefault();
            event.stopPropagation();
            document.dispatchEvent(new CustomEvent<GraphicMouseEvent>("Deck.GraphicMouseOut", { detail: new GraphicMouseEvent(event, this.slideId, graphicId) }));
        });

        svg.on("mouseup", (event: MouseEvent): void => {
            event.preventDefault();
            event.stopPropagation();
            document.dispatchEvent(new CustomEvent<GraphicMouseEvent>("Deck.GraphicMouseUp", { detail: new GraphicMouseEvent(event, this.slideId, graphicId) }));
        });

        svg.on("mousedown", (event: MouseEvent): void => {
            event.preventDefault();
            event.stopPropagation();
            document.dispatchEvent(new CustomEvent<GraphicMouseEvent>("Deck.GraphicMouseDown", { detail: new GraphicMouseEvent(event, this.slideId, graphicId) }));
        });
    }

    public focusGraphic(graphic: IGraphic | undefined) {
        // Unfocus the current graphic if there is one
        if (this._focusedGraphic !== undefined) {
            // Remove the anchor and bounding box graphics
            this._focusedGraphic.getAnchors(this).forEach((anchor: Anchor): void => this.removeGraphic(anchor.graphic.id));
            this.removeGraphic(this._focusedGraphic.boundingBoxId);
        }

        this._focusedGraphic = graphic;
        if (this._focusedGraphic !== undefined) {
            // Render the bounding box graphic
            const box: SVG.RBox = this._canvas.select(`#graphic_${this._focusedGraphic.id}`).first().rbox();
            const bounds: DOMRect = this.absoluteBounds();
            this._canvas.rect(box.width, box.height)
                .translate(box.x - bounds.x, box.y - bounds.y)
                .fill("none")
                .stroke({ color: "cyan", width: 1 })
                .id(`graphic_${this._focusedGraphic.boundingBoxId}`);

            // Render the anchor graphics
            this._focusedGraphic.getAnchors(this).forEach((anchor: Anchor): void => this.addGraphic(anchor.graphic));
        }
    }

    public setCursor(cursor: string): void {
        this._canvas.style("cursor", cursor);
    }

    public absoluteBounds(): DOMRect {
        return this._canvas.node.getBoundingClientRect() as DOMRect;
    }

    public getRenderedGraphic(id: string): SVG.Element {
        return this._canvas.select(`#graphic_${id}`).first();
    }

    public addGraphic(graphic: IGraphic): void {
        const svg: SVG.Element = graphic.render(this._canvas);

        if (graphic.defaultInteractive) {
            this._forwardGraphicEvents(graphic.id, svg);
        }
    }

    public updateGraphic(id: string, newGraphic: IGraphic): void {
        const svg: SVG.Element = this._canvas.select(`#graphic_${id}`).first();
        newGraphic.updateRendering(svg);
    }

    public removeGraphic(id: string): void {
        // Remove graphic from the canvas
        const svg: SVG.Element = this._canvas.select(`#graphic_${id}`).first();
        if (svg !== undefined) {
            svg.remove();
        }
    }
}
