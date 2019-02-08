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

    // public updateGraphic(id: string, newGraphic: IGraphic): IGraphic {
    //     // Update graphic in the store

    //     // Update graphic in the canvas
    // }

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