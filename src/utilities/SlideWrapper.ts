import * as SVG from "svg.js";
import IGraphic from "../models/IGraphic";
import Slide from "../models/Slide";

export default class SlideWrapper {
    private _slideId: string;
    private _canvas: SVG.Doc;
    private _store: any;

    constructor(slideId: string, canvas: SVG.Doc, store: any) {
        this._slideId = slideId;
        this._canvas = canvas;
        this._store = store;
        
        this._canvas.on("mousmove", (event: MouseEvent): void => {
            document.dispatchEvent(new CustomEvent("Deck.CanvasMouseMove", { detail: { event: event, slideId: this._slideId } }));
        });
        
        this._canvas.on("mouseover", (event: MouseEvent): void => {
            document.dispatchEvent(new CustomEvent("Deck.CanvasMouseOver", { detail: { event: event, slideId: this._slideId } }));
        });
        
        this._canvas.on("mouseout", (event: MouseEvent): void => {
            document.dispatchEvent(new CustomEvent("Deck.CanvasMouseOut", { detail: { event: event, slideId: this._slideId } }));
        });
        
        this._canvas.on("mouseup", (event: MouseEvent): void => {
            document.dispatchEvent(new CustomEvent("Deck.CanvasMouseUp", { detail: { event: event, slideId: this._slideId } }));
        });

        this._canvas.on("mousedown", (event: MouseEvent): void => {
            document.dispatchEvent(new CustomEvent("Deck.CanvasMouseDown", { detail: { event: event, slideId: this._slideId } }));
        });
    }

    public addGraphic(graphic: IGraphic): void {
        // Add graphic to the store
        this._store.commit("addGraphic", { slideId: this._slideId, graphic: graphic });

        // Add graphic to the canvas
        graphic.render(this._canvas);
    }

    public getGraphic(id: string): IGraphic | undefined {
        const slide: Slide = this._store.getters.slides.find((s: Slide): boolean => s.id === this._slideId);

        if (slide === undefined) {
            throw `ERROR: Could not find a slide with the id: "${id}"`;
        }

        return slide.graphics.find((graphic: IGraphic): boolean => graphic.id === id);
    }

    public updateGraphic(id: string, newGraphic: any): void {
        // Update graphic in the store
        this._store.commit("updateGraphic", { graphic: newGraphic });

        // Update graphic in the canvas
        const graphic: IGraphic | undefined = this.getGraphic(id);

        if (graphic === undefined) {
            throw `ERROR: Could not find a graphic with the id: "${id}"`;
        }

        graphic.update(newGraphic);

        // Update the bounding box rendering if the graphic is focused
        const focusedGraphic: IGraphic | undefined = this._store.getters.focusedGraphic;
        if (focusedGraphic !== undefined && focusedGraphic.id === graphic.id) {
            SVG.get(graphic.boundingBoxId).remove();
            graphic.boundingBox.render(this._canvas);
        }
    }

    public removeGraphic(id: string): void {
        // Remove graphic from the store
        this._store.commit("removeGraphic", { slideId: this._slideId, graphicId: id });

        // Remove graphic from the canvas
        const svg: SVG.Element = SVG.get(id);
        if (svg !== undefined) {
            svg.remove();
        }
    }
};