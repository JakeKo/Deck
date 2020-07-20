import { ImageRenderer, RectangleRenderer } from "../rendering/graphics";
import SlideRenderer from "../rendering/SlideRenderer";
import { GraphicRenderer, GRAPHIC_TYPES } from "../rendering/types";
import { AppStore, GraphicStoreModel, ImageStoreModel, MUTATIONS, RectangleStoreModel } from "../store/types";

export default class SlideStateManager {
    private _slideId: string;
    private _store: AppStore | undefined;
    private _renderer: SlideRenderer | undefined;

    constructor(slideId: string) {
        this._slideId = slideId;
    }

    private _imageStoreModelToRenderer(image: ImageStoreModel): ImageRenderer {
        return new ImageRenderer({
            id: image.id,
            slideRenderer: this._renderer!,
            origin: image.origin,
            image: image.source,
            width: image.width,
            height: image.height,
            strokeColor: image.strokeColor,
            strokeWidth: image.strokeWidth,
            rotation: image.rotation
        });
    }

    private _imageRendererToStoreModel(image: ImageRenderer): ImageStoreModel {
        return {
            id: image.getId(),
            type: GRAPHIC_TYPES.IMAGE,
            source: image.getImage(),
            origin: image.getOrigin(),
            height: image.getHeight(),
            width: image.getWidth(),
            strokeColor: image.getStrokeColor(),
            strokeWidth: image.getStrokeWidth(),
            rotation: image.getRotation()
        };
    }

    private _rectangleStoreModelToRenderer(rectangle: RectangleStoreModel): RectangleRenderer {
        return new RectangleRenderer({
            id: rectangle.id,
            slideRenderer: this._renderer!,
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

    public setStore(store: AppStore): void {
        this._store = store;
    }

    public setRenderer(renderer: SlideRenderer): void {
        this._renderer = renderer;
    }

    public setGraphicFromRenderer(graphic: GraphicRenderer): void {
        if (graphic.getType() === GRAPHIC_TYPES.RECTANGLE) {
            const storeModel = this._rectangleRendererToStoreModel(graphic as RectangleRenderer);
            this._store && this._store.commit(MUTATIONS.SET_GRAPHIC, {
                slide: this._slideId,
                graphic: storeModel
            });
        } else if (graphic.getType() === GRAPHIC_TYPES.IMAGE) {
            const storeModel = this._imageRendererToStoreModel(graphic as ImageRenderer);
            this._store && this._store.commit(MUTATIONS.SET_GRAPHIC, {
                slide: this._slideId,
                graphic: storeModel
            });
        }
    }

    public removeGraphicFromRenderer(graphicId: string): void {
        this._store && this._store.commit(MUTATIONS.REMOVE_GRAPHIC, {
            slideId: this._slideId,
            graphicId
        });
    }

    public setGraphicFromStore(graphic: GraphicStoreModel): void {
        if (graphic.type === GRAPHIC_TYPES.RECTANGLE) {
            const renderer = this._rectangleStoreModelToRenderer(graphic);
            this._renderer && this._renderer.setGraphic(renderer);
        } else if (graphic.type === GRAPHIC_TYPES.IMAGE) {
            const renderer = this._imageStoreModelToRenderer(graphic);
            this._renderer && this._renderer.setGraphic(renderer);
        }
    }

    public removeGraphicFromStore(graphicId: string): void {
        this._renderer && this._renderer.removeGraphic(graphicId);
    }
}
