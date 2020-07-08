import { AppStore, RectangleStoreModel, MUTATIONS } from "../store/types";
import SlideRenderer from "../rendering/SlideRenderer";
import { RectangleRenderer } from "../rendering/graphics";
import { GRAPHIC_TYPES } from "../rendering/types";

export default class SlideStateManager {
    private _slideId: string;
    private _store: AppStore;
    private _renderer: SlideRenderer;

    constructor(slideId: string, store: AppStore, renderer: SlideRenderer) {
        this._slideId = slideId;
        this._store = store;
        this._renderer = renderer;
    }

    private _rectangleStoreModelToRenderer(rectangle: RectangleStoreModel): RectangleRenderer {
        return new RectangleRenderer({
            id: rectangle.id,
            slideRenderer: this._renderer,
            origin: rectangle.origin,
            width: rectangle.width,
            height: rectangle.height,
            fillColor: rectangle.fillColor,
            strokeColor: rectangle.strokeColor,
            strokeWidth: rectangle.strokeWidth,
            rotation: rectangle.strokeWidth
        });
    }

    private _rectangleRendererToStoreModel(rectangle: RectangleRenderer): RectangleStoreModel {
        return {
            id: rectangle.getId(),
            type: GRAPHIC_TYPES.RECTANGLE,
            origin: rectangle.getOrigin(),
            width: rectangle.getWidth(),
            height: rectangle.getHeight(),
            fillColor: rectangle.getFillColor(),
            strokeColor: rectangle.getStrokeColor(),
            strokeWidth: rectangle.getStrokeWidth(),
            rotation: rectangle.getRotation()
        };
    }

    // Rectangle Methods
    public addRectangleFromRenderer(rectangle: RectangleRenderer): void {
        const storeModel = this._rectangleRendererToStoreModel(rectangle);
        this._store.commit(MUTATIONS.ADD_RECTANGLE, {
            slideId: this._slideId,
            rectangle: storeModel
        });
    }

    public addRectangleFromStore(rectangle: RectangleStoreModel): void {
        const renderer = this._rectangleStoreModelToRenderer(rectangle);
        this._renderer.addRectangle(renderer);
    }

    public updateRectangleFromRenderer(rectangle: RectangleRenderer): void {
        const storeModel = this._rectangleRendererToStoreModel(rectangle);
        this._store.commit(MUTATIONS.UPDATE_RECTANGLE, {
            slideId: this._slideId,
            rectangle: storeModel
        });
    }

    public updateRectangleFromStore(rectangle: RectangleStoreModel): void {
        const renderer = this._rectangleStoreModelToRenderer(rectangle);
        this._renderer.updateRectangle(renderer);
    }

    // Generic Graphic Methods
    public removeGraphicFromRenderer(graphicId: string): void {
        this._store.commit(MUTATIONS.REMOVE_GRAPHIC, {
            slideId: this._slideId,
            graphicId
        });
    }

    public removeGraphicFromStore(graphicId: string): void {
        this._renderer.removeGraphic(graphicId);
    }
}
