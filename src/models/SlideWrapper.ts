import * as SVG from "svg.js";
import { IGraphic, CustomMouseEvent, ISlideWrapper, IRootState, GraphicEvent, CanvasMouseEvent, GraphicMouseEvent, Anchor } from "../types";
import Vector from "./Vector";
import { Store } from "vuex";

export default class SlideWrapper implements ISlideWrapper {
    public store: Store<IRootState>;
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
            if (detail.slideId === this.slideId && (this.renderSupplementary || (detail.graphic !== undefined && !detail.graphic!.supplementary))) {
                this.focusGraphic(detail.graphic);
            }
        });

        this._forwardCanvasEvents();
    }

    private _forwardCanvasEvents(): void {
        this._canvas.on("mousemove", (event: MouseEvent): void => {
            document.dispatchEvent(new CustomEvent<CanvasMouseEvent>("Deck.CanvasMouseMove", { detail: { baseEvent: event, slideId: this.slideId } }));
        });

        this._canvas.on("mouseover", (event: MouseEvent): void => {
            document.dispatchEvent(new CustomEvent<CanvasMouseEvent>("Deck.CanvasMouseOver", { detail: { baseEvent: event, slideId: this.slideId } }));
        });

        this._canvas.on("mouseout", (event: MouseEvent): void => {
            document.dispatchEvent(new CustomEvent<CanvasMouseEvent>("Deck.CanvasMouseOut", { detail: { baseEvent: event, slideId: this.slideId } }));
        });

        this._canvas.on("mouseup", (event: MouseEvent): void => {
            document.dispatchEvent(new CustomEvent<CanvasMouseEvent>("Deck.CanvasMouseUp", { detail: { baseEvent: event, slideId: this.slideId } }));
        });

        this._canvas.on("mousedown", (event: MouseEvent): void => {
            document.dispatchEvent(new CustomEvent<CanvasMouseEvent>("Deck.CanvasMouseDown", { detail: { baseEvent: event, slideId: this.slideId } }));
        });
    }

    private _forwardGraphicEvents(graphicId: string, svg: SVG.Element): void {
        svg.on("mouseover", (event: MouseEvent): void => {
            document.dispatchEvent(new CustomEvent<GraphicMouseEvent>("Deck.GraphicMouseOver", { detail: { baseEvent: event, slideId: this.slideId, graphicId } }));
        });

        svg.on("mouseout", (event: MouseEvent): void => {
            document.dispatchEvent(new CustomEvent<GraphicMouseEvent>("Deck.GraphicMouseOut", { detail: { baseEvent: event, slideId: this.slideId, graphicId } }));
        });

        svg.on("mouseup", (event: MouseEvent): void => {
            document.dispatchEvent(new CustomEvent<GraphicMouseEvent>("Deck.GraphicMouseUp", { detail: { baseEvent: event, slideId: this.slideId, graphicId } }));
        });

        svg.on("mousedown", (event: MouseEvent): void => {
            document.dispatchEvent(new CustomEvent<GraphicMouseEvent>("Deck.GraphicMouseDown", { detail: { baseEvent: event, slideId: this.slideId, graphicId } }));
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

                const svg: SVG.Element = this._canvas.select(`#graphic_${this._focusedGraphic!.id}`).first();
                const anchorSvg: SVG.Element = this._canvas.select(`#graphic_${anchor.graphic.id}`).first();
                anchorSvg.on("mouseover", (event: MouseEvent): void => {
                    this.setCursor(anchor.cursor);
                });

                anchorSvg.on("mouseout", (event: MouseEvent): void => {
                    this.setCursor("default");
                });

                anchorSvg.on("mousedown", (event: MouseEvent): void => {
                    event.stopPropagation();
                    document.addEventListener("Deck.CanvasMouseMove", preview);
                    document.addEventListener("Deck.GraphicMouseMove", preview);
                    document.addEventListener("Deck.CanvasMouseUp", end);
                    document.addEventListener("Deck.GraphicMouseUp", end);
                    document.addEventListener("keydown", toggleSquare);
                    document.addEventListener("keyup", toggleSquare);

                    const self: SlideWrapper = this;
                    focusedGraphic.anchorIds.forEach((anchorId: string): void => self.removeGraphic(anchorId));
                    let lastPosition: Vector = new Vector(event.clientX, event.clientY);
                    let shiftPressed = false;

                    function preview(event: Event): void {
                        const customEvent: CustomMouseEvent = event as CustomMouseEvent;
                        lastPosition = new Vector(customEvent.detail.baseEvent.clientX, customEvent.detail.baseEvent.clientY);
                        anchor.handler(customEvent);
                        focusedGraphic.updateRendering(svg);
                        self.store.commit("updateGraphic", { slideId: self.slideId, graphicId: focusedGraphic.id, graphic: focusedGraphic });
                    }

                    function end(): void {
                        document.removeEventListener("Deck.CanvasMouseMove", preview);
                        document.removeEventListener("Deck.GraphicMouseMove", preview);
                        document.removeEventListener("Deck.CanvasMouseUp", end);
                        document.removeEventListener("Deck.GraphicMouseUp", end);
                        document.removeEventListener("keydown", toggleSquare);
                        document.removeEventListener("keyup", toggleSquare);

                        self.store.commit("removeSnapVectors", { slideId: self.slideId, graphicId: focusedGraphic.id });
                        self.store.commit("addSnapVectors", { slideId: self.slideId, snapVectors: focusedGraphic.getSnapVectors() });
                        self.store.commit("focusGraphic", { slideId: self.slideId, graphicId: focusedGraphic.id });
                    }

                    function toggleSquare(event: KeyboardEvent): void {
                        if (event.key !== "Shift" || (event.type === "keydown" && shiftPressed)) {
                            return;
                        }

                        shiftPressed = event.type === "keydown";
                        document.dispatchEvent(new CustomEvent<CanvasMouseEvent>("Deck.CanvasMouseMove", {
                            detail: {
                                baseEvent: new MouseEvent("mousemove", {
                                    shiftKey: event.type === "keydown",
                                    clientX: lastPosition.x,
                                    clientY: lastPosition.y
                                }),
                                slideId: self.slideId
                            }
                        }));
                    }
                });
            });
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

    public getPosition(event: CustomMouseEvent): Vector {
        const zoom: number = this.store.getters.canvasZoom;
        const bounds: DOMRect = this.absoluteBounds();
        const viewbox: { x: number, y: number, width: number, height: number } = this.store.getters.rawViewbox;

        return new Vector(event.detail.baseEvent.pageX, event.detail.baseEvent.pageY)
            .add(new Vector(-bounds.x, -bounds.y))
            .add(new Vector(viewbox.x, viewbox.y))
            .scale(1 / zoom)
            .transform(Math.round);
    }
}
