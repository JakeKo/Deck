import * as SVG from "svg.js";
import IGraphic from "../models/graphics/IGraphic";
import Slide from "../models/Slide";

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

        document.addEventListener("Deck.CanvasDeletePressed", (): void => {
            if (this.store.getters.activeSlide.id !== this.slideId || this._focusedGraphicId === undefined) {
                return;
            }

            // Store the focusedGraphicId so we can first unfocus it, then delete it
            const focusedGraphicId: string = this._focusedGraphicId;
            this.focusGraphic(undefined);
            this.removeGraphic(focusedGraphicId);
        });

        document.addEventListener("Deck.ActiveSlideChanged", (): void => {
            this.focusGraphic(undefined);
        });

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

        this._focusedGraphicId = graphicToFocus.id;
        this.addGraphic(graphicToFocus.boundingBox);
    }

    public setCursor(cursor: string): void {
        this._canvas.style("cursor", cursor);
    }

    public addGraphic(graphic: IGraphic): void {
        // Add graphic to the canvas
        const svg: SVG.Element = graphic.render(this._canvas);

        // Bind each event handler
        svg.on("mouseover", (event: MouseEvent): void => {
            event.preventDefault();
            event.stopPropagation();
            document.dispatchEvent(new CustomEvent("Deck.GraphicMouseOver", { detail: { baseEvent: event, slideId: this.slideId, graphicId: graphic.id } }));
        });

        svg.on("mouseout", (event: MouseEvent): void => {
            event.preventDefault();
            event.stopPropagation();
            document.dispatchEvent(new CustomEvent("Deck.GraphicMouseOut", { detail: { baseEvent: event, slideId: this.slideId, graphicId: graphic.id } }));
        });

        svg.on("mouseup", (event: MouseEvent): void => {
            event.preventDefault();
            event.stopPropagation();
            document.dispatchEvent(new CustomEvent("Deck.GraphicMouseUp", { detail: { baseEvent: event, slideId: this.slideId, graphicId: graphic.id } }));
        });

        svg.on("mousedown", (event: MouseEvent): void => {
            event.preventDefault();
            event.stopPropagation();
            document.dispatchEvent(new CustomEvent("Deck.GraphicMouseDown", { detail: { baseEvent: event, slideId: this.slideId, graphicId: graphic.id } }));
        });
    }

    public getGraphic(id: string): IGraphic | undefined {
        const slide: Slide = this.store.getters.slides.find((s: Slide): boolean => s.id === this.slideId);

        if (slide === undefined) {
            throw `ERROR: Could not find a slide with the id: "${id}"`;
        }

        return slide.graphics.find((graphic: IGraphic): boolean => graphic.id === id);
    }

    public updateGraphic(id: string, newGraphic: any): void {
        this.removeGraphic(id);
        this.addGraphic(newGraphic);
    }

    public removeGraphic(id: string): void {
        // Remove graphic from the canvas
        const svg: SVG.Element = this._canvas.select(`#graphic_${id}`).first();
        if (svg !== undefined) {
            svg.remove();
        }
    }
}
