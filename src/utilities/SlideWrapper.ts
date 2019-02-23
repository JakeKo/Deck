import * as SVG from "svg.js";
import IGraphic from "../models/graphics/IGraphic";
import Slide from "../models/Slide";
import Video from "../models/graphics/Video";

export default class SlideWrapper {
    public store: any;
    public slideId: string;

    private _canvas: SVG.Doc;
    private _focusedGraphicId: string | undefined;

    constructor(slideId: string, canvas: SVG.Doc, store: any) {
        this.store = store;
        this.slideId = slideId;
        this._canvas = canvas;
        this._focusedGraphicId = undefined;

        document.addEventListener("Deck.GraphicAdded", (event: Event): void => {
            // Check that the event pertains to the wrapper's specific slide
            if ((event as CustomEvent).detail.slideId !== this.slideId) {
                return;
            }

            const graphicId: string = (event as CustomEvent).detail.graphicId;
            const graphic: IGraphic | undefined = this.getGraphic(graphicId);
            if (graphic === undefined) {
                console.error(`ERROR: No such graphic ("${graphicId}") exists on slide ("${this.slideId}")`);
                return;
            }

            this.addGraphic(graphic);
        });

        document.addEventListener("Deck.GraphicRemoved", (event: Event): void => {
            // Check that the event pertains to the wrapper's specific slide
            if ((event as CustomEvent).detail.slideId !== this.slideId) {
                return;
            }

            this.removeGraphic((event as CustomEvent).detail.graphicId);
        });

        document.addEventListener("Deck.GraphicUpdated", (event: Event): void => {
            // Check that the event pertains to the wrapper's specific slide
            if ((event as CustomEvent).detail.slideId !== this.slideId) {
                return;
            }

            const graphicId: string = (event as CustomEvent).detail.graphicId;
            const graphic: IGraphic | undefined = this.getGraphic(graphicId);
            if (graphic === undefined) {
                console.error(`ERROR: No such graphic ("${graphicId}") exists on slide ("${this.slideId}")`);
                return;
            }

            this.updateGraphic(graphicId, graphic);
        });

        document.addEventListener("Deck.GraphicFocused", (event: Event): void => {
            // Check that the event pertains to the wrapper's specific slide
            if ((event as CustomEvent).detail.slideId !== this.slideId) {
                return;
            }

            const graphicId: string = (event as CustomEvent).detail.graphicId;
            if (graphicId === undefined) {
                this.focusGraphic(undefined);
                return;
            }

            const graphic: IGraphic | undefined = this.getGraphic(graphicId);
            if (graphic === undefined) {
                console.error(`ERROR: No such graphic ("${graphicId}") exists on slide ("${this.slideId}")`);
                return;
            }

            this.focusGraphic(graphicId);
        });

        this._forwardCanvasEvents();
    }

    private _forwardCanvasEvents(): void {
        this._canvas.on("mousemove", (event: MouseEvent): void => {
            event.preventDefault();
            event.stopPropagation();
            document.dispatchEvent(new CustomEvent("Deck.CanvasMouseMove", { detail: { baseEvent: event, slideId: this.slideId } }));
        });

        this._canvas.on("mouseover", (event: MouseEvent): void => {
            event.preventDefault();
            event.stopPropagation();
            document.dispatchEvent(new CustomEvent("Deck.CanvasMouseOver", { detail: { baseEvent: event, slideId: this.slideId } }));
        });

        this._canvas.on("mouseout", (event: MouseEvent): void => {
            event.preventDefault();
            event.stopPropagation();
            document.dispatchEvent(new CustomEvent("Deck.CanvasMouseOut", { detail: { baseEvent: event, slideId: this.slideId } }));
        });

        this._canvas.on("mouseup", (event: MouseEvent): void => {
            event.preventDefault();
            event.stopPropagation();
            document.dispatchEvent(new CustomEvent("Deck.CanvasMouseUp", { detail: { baseEvent: event, slideId: this.slideId } }));
        });

        this._canvas.on("mousedown", (event: MouseEvent): void => {
            event.preventDefault();
            event.stopPropagation();
            document.dispatchEvent(new CustomEvent("Deck.CanvasMouseDown", { detail: { baseEvent: event, slideId: this.slideId } }));
        });
    }

    private _forwardGraphicEvents(graphicId: string, svg: SVG.Element): void {
        svg.on("mouseover", (event: MouseEvent): void => {
            event.preventDefault();
            event.stopPropagation();
            document.dispatchEvent(new CustomEvent("Deck.GraphicMouseOver", { detail: { baseEvent: event, slideId: this.slideId, graphicId: graphicId } }));
        });

        svg.on("mouseout", (event: MouseEvent): void => {
            event.preventDefault();
            event.stopPropagation();
            document.dispatchEvent(new CustomEvent("Deck.GraphicMouseOut", { detail: { baseEvent: event, slideId: this.slideId, graphicId: graphicId } }));
        });

        svg.on("mouseup", (event: MouseEvent): void => {
            event.preventDefault();
            event.stopPropagation();
            document.dispatchEvent(new CustomEvent("Deck.GraphicMouseUp", { detail: { baseEvent: event, slideId: this.slideId, graphicId: graphicId } }));
        });

        svg.on("mousedown", (event: MouseEvent): void => {
            event.preventDefault();
            event.stopPropagation();
            document.dispatchEvent(new CustomEvent("Deck.GraphicMouseDown", { detail: { baseEvent: event, slideId: this.slideId, graphicId: graphicId } }));
        });
    }

    public focusGraphic(id: string | undefined) {
        // Unfocus the current graphic if there is one
        if (this._focusedGraphicId !== undefined) {
            const focusedGraphic: IGraphic | undefined = this.getGraphic(this._focusedGraphicId);

            if (focusedGraphic === undefined) {
                console.error(`ERROR: Could not find a graphic with the id ${this._focusedGraphicId}`);
                return;
            }

            this.removeGraphic(focusedGraphic.boundingBoxId);
        }

        // Exit if no object is being focused
        if (id === undefined) {
            this._focusedGraphicId = undefined;
            return;
        }

        // Try to focus the new graphic and render the bounding box
        const graphicToFocus: IGraphic | undefined = this.getGraphic(id);
        if (graphicToFocus === undefined) {
            this._focusedGraphicId = undefined;
            console.error(`ERROR: Could not find a graphic with the id ${id}`);
            return;
        }

        // Update the focused graphis and the bounding box
        // Note videos are bounded asynchronously so listen for the metadata event
        this._focusedGraphicId = graphicToFocus.id;
        if (graphicToFocus.type === "video" && !(graphicToFocus as Video).metadataLoaded) {
            document.addEventListener("Deck.VideoMetadataLoaded", (event: Event): void => {
                if ((event as CustomEvent).detail.graphicId === graphicToFocus.id) {
                    this.addGraphic(graphicToFocus.boundingBox);
                }
            });
        } else {
            this.addGraphic(graphicToFocus.boundingBox);
        }
    }

    public setCursor(cursor: string): void {
        this._canvas.style("cursor", cursor);
    }

    public addGraphic(graphic: IGraphic): void {
        if (graphic.type === "video" && !(graphic as Video).metadataLoaded) {
            document.addEventListener("Deck.VideoMetadataLoaded", (event: Event): void => {
                if ((event as CustomEvent).detail.graphicId === graphic.id) {
                    const svg: SVG.Element = graphic.render(this._canvas);
                    this._forwardGraphicEvents(graphic.id, svg);
                }
            });
        } else {
            const svg: SVG.Element = graphic.render(this._canvas);
            this._forwardGraphicEvents(graphic.id, svg);
        }
    }

    public getGraphic(id: string): IGraphic | undefined {
        const slide: Slide = this.store.getters.slides.find((s: Slide): boolean => s.id === this.slideId);

        if (slide === undefined) {
            throw `ERROR: Could not find a slide with the id: "${id}"`;
        }

        return slide.graphics.find((graphic: IGraphic): boolean => graphic.id === id);
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
