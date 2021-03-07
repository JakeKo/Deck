import { IGraphicRenderer, ISlideRenderer } from '@/rendering/types';
import { AppStore, GraphicStoreModel } from '@/store/types';
import { graphicStoreModelToGraphicRenderer } from './parsing/renderer';
import { graphicRendererToGraphicStoreModel } from './parsing/storeModel';

export default class SlideStateManager {
    private _slideId: string;
    private _store: AppStore | undefined;
    private _renderer: ISlideRenderer | undefined;

    constructor(slideId: string) {
        this._slideId = slideId;
    }

    public setStore(store: AppStore): void {
        this._store = store;
    }

    public setRenderer(renderer: ISlideRenderer): void {
        this._renderer = renderer;
    }

    public setGraphicFromRenderer(graphic: IGraphicRenderer): void {
        const storeModel = graphicRendererToGraphicStoreModel(graphic);
        this._store && this._store.mutations.setGraphic(this._slideId, storeModel);
    }

    public removeGraphicFromRenderer(graphicId: string): void {
        this._store && this._store.mutations.removeGraphic(this._slideId, graphicId);
    }

    public focusGraphicFromRenderer(graphicId: string): void {
        this._store && this._store.mutations.focusGraphic(this._slideId, graphicId);
    }

    public unfocusGraphicFromRenderer(graphicId: string): void {
        this._store && this._store.mutations.unfocusGraphic(this._slideId, graphicId);
    }

    public setGraphicFromStore(graphic: GraphicStoreModel): void {
        if (this._renderer === undefined) {
            throw new Error('Cannot convert from store model to renderer with undefined slide renderer');
        }

        const renderer = graphicStoreModelToGraphicRenderer(graphic, this._renderer);
        this._renderer && this._renderer.setGraphic(renderer);
    }

    public setXFromStore(graphicId: string, x: number): void {
        this._renderer && this._renderer.setX(graphicId, x);
    }

    public setYFromStore(graphicId: string, y: number): void {
        this._renderer && this._renderer.setY(graphicId, y);
    }

    public setFillColorFromStore(graphicId: string, fillColor: string): void {
        this._renderer && this._renderer.setFillColor(graphicId, fillColor);
    }

    public setStrokeColorFromStore(graphicId: string, strokeColor: string): void {
        this._renderer && this._renderer.setStrokeColor(graphicId, strokeColor);
    }

    public setStrokeWidthFromStore(graphicId: string, strokeWidth: number): void {
        this._renderer && this._renderer.setStrokeWidth(graphicId, strokeWidth);
    }

    public setWidthFromStore(graphicId: string, width: number): void {
        this._renderer && this._renderer.setWidth(graphicId, width);
    }

    public setHeightFromStore(graphicId: string, height: number): void {
        this._renderer && this._renderer.setHeight(graphicId, height);
    }

    public setRotationFromStore(graphicId: string, rotation: number): void {
        this._renderer && this._renderer.setRotation(graphicId, rotation);
    }

    public setTextFromStore(graphicId: string, text: string): void {
        this._renderer && this._renderer.setText(graphicId, text);
    }

    public removeGraphicFromStore(graphicId: string): void {
        this._renderer && this._renderer.removeGraphic(graphicId);
    }

    public focusGraphicFromStore(graphicId: string): void {
        this._renderer && this._renderer.focusGraphic(graphicId);
    }

    public unfocusGraphicFromStore(graphicId: string): void {
        this._renderer && this._renderer.unfocusGraphic(graphicId);
    }
}
