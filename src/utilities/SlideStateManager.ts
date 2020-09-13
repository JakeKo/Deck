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
