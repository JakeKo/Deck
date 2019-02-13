import * as SVG from "svg.js";
import IGraphic from "../models/IGraphic";
import Slide from "../models/Slide";

export default class SlideWrapper {
    public store: any;
    public slideId: string;

    private _canvas: SVG.Doc;

    constructor(slideId: string, canvas: SVG.Doc, store: any) {
        this.store = store;
        this.slideId = slideId;
        this._canvas = canvas;

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
