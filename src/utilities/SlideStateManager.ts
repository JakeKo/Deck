import { CurveRenderer, EllipseRenderer, ImageRenderer, RectangleRenderer, TextboxRenderer, VideoRenderer } from '@/rendering/graphics';
import SlideRenderer from '@/rendering/SlideRenderer';
import { CurveAnchor, GRAPHIC_TYPES, ICurveRenderer, IEllipseRenderer, IGraphicRenderer, IImageRenderer, IRectangleRenderer, ITextboxRenderer, IVideoRenderer } from '@/rendering/types';
import { AppStore, CurveStoreModel, EllipseStoreModel, GraphicStoreModel, ImageStoreModel, RectangleStoreModel, TextboxStoreModel, VideoStoreModel } from '@/store/types';
import Vector from './Vector';

export default class SlideStateManager {
    private _slideId: string;
    private _store: AppStore | undefined;
    private _renderer: SlideRenderer | undefined;

    constructor(slideId: string) {
        this._slideId = slideId;
    }

    public setStore(store: AppStore): void {
        this._store = store;
    }

    public setRenderer(renderer: SlideRenderer): void {
        this._renderer = renderer;
    }

    public setGraphicFromRenderer(graphic: IGraphicRenderer): void {
        if (graphic.type === GRAPHIC_TYPES.CURVE) {
            const storeModel = this._curveRendererToStoreModel(graphic);
            this._store && this._store.setGraphic(this._slideId, storeModel);
        } else if (graphic.type === GRAPHIC_TYPES.ELLIPSE) {
            const storeModel = this._ellipseRendererToStoreModel(graphic);
            this._store && this._store.setGraphic(this._slideId, storeModel);
        } else if (graphic.type === GRAPHIC_TYPES.IMAGE) {
            const storeModel = this._imageRendererToStoreModel(graphic);
            this._store && this._store.setGraphic(this._slideId, storeModel);
        } else if (graphic.type === GRAPHIC_TYPES.RECTANGLE) {
            const storeModel = this._rectangleRendererToStoreModel(graphic);
            this._store && this._store.setGraphic(this._slideId, storeModel);
        } else if (graphic.type === GRAPHIC_TYPES.TEXTBOX) {
            const storeModel = this._textboxRendererToStoreModel(graphic);
            this._store && this._store.setGraphic(this._slideId, storeModel);
        } else if (graphic.type === GRAPHIC_TYPES.VIDEO) {
            const storeModel = this._videoRendererToStoreModel(graphic);
            this._store && this._store.setGraphic(this._slideId, storeModel);
        }
    }

    public removeGraphicFromRenderer(graphicId: string): void {
        this._store && this._store.removeGraphic(this._slideId, graphicId);
    }

    public setGraphicFromStore(graphic: GraphicStoreModel): void {
        if (graphic.type === GRAPHIC_TYPES.CURVE) {
            const renderer = this._curveStoreModelToRenderer(graphic);
            this._renderer && this._renderer.setGraphic(renderer);
        } else if (graphic.type === GRAPHIC_TYPES.ELLIPSE) {
            const renderer = this._ellipseStoreModelToRenderer(graphic);
            this._renderer && this._renderer.setGraphic(renderer);
        } else if (graphic.type === GRAPHIC_TYPES.IMAGE) {
            const renderer = this._imageStoreModelToRenderer(graphic);
            this._renderer && this._renderer.setGraphic(renderer);
        } else if (graphic.type === GRAPHIC_TYPES.RECTANGLE) {
            const renderer = this._rectangleStoreModelToRenderer(graphic);
            this._renderer && this._renderer.setGraphic(renderer);
        } else if (graphic.type === GRAPHIC_TYPES.TEXTBOX) {
            const renderer = this._textboxStoreModelToRenderer(graphic);
            this._renderer && this._renderer.setGraphic(renderer);
        } else if (graphic.type === GRAPHIC_TYPES.VIDEO) {
            const renderer = this._videoStoreModelToRenderer(graphic);
            this._renderer && this._renderer.setGraphic(renderer);
        }
    }

    public removeGraphicFromStore(graphicId: string): void {
        this._renderer && this._renderer.removeGraphic(graphicId);
    }

    private _curveStoreModelToRenderer(curve: CurveStoreModel): ICurveRenderer {
        if (this._renderer === undefined) {
            throw new Error('Cannot convert from store model to renderer with undefined slide renderer');
        }

        return new CurveRenderer({
            id: curve.id,
            slide: this._renderer,
            anchors: curve.points.reduce<CurveAnchor[]>((anchors, _, index) => index % 3 === 0 ? [...anchors, {
                inHandle: curve.points[index],
                point: curve.points[index + 1],
                outHandle: curve.points[index + 2]
            }] : anchors, []),
            fillColor: curve.fillColor,
            strokeColor: curve.strokeColor,
            strokeWidth: curve.strokeWidth,
            rotation: curve.rotation
        });
    }

    private _curveRendererToStoreModel(curve: ICurveRenderer): CurveStoreModel {
        return {
            id: curve.id,
            type: GRAPHIC_TYPES.CURVE,
            points: curve.anchors.reduce<Vector[]>((points, anchor) => [...points, anchor.inHandle, anchor.point, anchor.outHandle], []),
            fillColor: curve.fillColor,
            strokeColor: curve.strokeColor,
            strokeWidth: curve.strokeWidth,
            rotation: curve.rotation
        };
    }

    private _ellipseStoreModelToRenderer(ellipse: EllipseStoreModel): IEllipseRenderer {
        if (this._renderer === undefined) {
            throw new Error('Cannot convert from store model to renderer with undefined slide renderer');
        }

        return new EllipseRenderer({
            id: ellipse.id,
            slide: this._renderer,
            center: ellipse.center,
            dimensions: new Vector(ellipse.width, ellipse.height),
            fillColor: ellipse.fillColor,
            strokeColor: ellipse.strokeColor,
            strokeWidth: ellipse.strokeWidth,
            rotation: ellipse.strokeWidth
        });
    }

    private _ellipseRendererToStoreModel(ellipse: IEllipseRenderer): EllipseStoreModel {
        return {
            id: ellipse.id,
            type: GRAPHIC_TYPES.ELLIPSE,
            center: ellipse.center,
            width: ellipse.dimensions.x,
            height: ellipse.dimensions.y,
            fillColor: ellipse.fillColor,
            strokeColor: ellipse.strokeColor,
            strokeWidth: ellipse.strokeWidth,
            rotation: ellipse.rotation
        };
    }

    private _imageStoreModelToRenderer(image: ImageStoreModel): IImageRenderer {
        if (this._renderer === undefined) {
            throw new Error('Cannot convert from store model to renderer with undefined slide renderer');
        }

        return new ImageRenderer({
            id: image.id,
            slide: this._renderer,
            origin: image.origin,
            source: image.source,
            dimensions: new Vector(image.width, image.height),
            strokeColor: image.strokeColor,
            strokeWidth: image.strokeWidth,
            rotation: image.rotation
        });
    }

    private _imageRendererToStoreModel(image: IImageRenderer): ImageStoreModel {
        return {
            id: image.id,
            type: GRAPHIC_TYPES.IMAGE,
            source: image.source,
            origin: image.origin,
            height: image.dimensions.y,
            width: image.dimensions.x,
            strokeColor: image.strokeColor,
            strokeWidth: image.strokeWidth,
            rotation: image.rotation
        };
    }

    private _rectangleStoreModelToRenderer(rectangle: RectangleStoreModel): IRectangleRenderer {
        if (this._renderer === undefined) {
            throw new Error('Cannot convert from store model to renderer with undefined slide renderer');
        }

        return new RectangleRenderer({
            id: rectangle.id,
            slide: this._renderer,
            origin: rectangle.origin,
            dimensions: new Vector(rectangle.width, rectangle.height),
            fillColor: rectangle.fillColor,
            strokeColor: rectangle.strokeColor,
            strokeWidth: rectangle.strokeWidth,
            rotation: rectangle.strokeWidth
        });
    }

    private _rectangleRendererToStoreModel(rectangle: IRectangleRenderer): RectangleStoreModel {
        return {
            id: rectangle.id,
            type: GRAPHIC_TYPES.RECTANGLE,
            origin: rectangle.origin,
            width: rectangle.dimensions.x,
            height: rectangle.dimensions.y,
            fillColor: rectangle.fillColor,
            strokeColor: rectangle.strokeColor,
            strokeWidth: rectangle.strokeWidth,
            rotation: rectangle.rotation
        };
    }

    private _textboxStoreModelToRenderer(textbox: TextboxStoreModel): ITextboxRenderer {
        if (this._renderer === undefined) {
            throw new Error('Cannot convert from store model to renderer with undefined slide renderer');
        }

        return new TextboxRenderer({
            id: textbox.id,
            slide: this._renderer,
            text: textbox.text,
            origin: textbox.origin,
            dimensions: new Vector(textbox.width, textbox.height),
            fontSize: textbox.size,
            fontWeight: textbox.weight,
            typeface: textbox.font,
            rotation: textbox.rotation
        });
    }

    private _textboxRendererToStoreModel(textbox: ITextboxRenderer): TextboxStoreModel {
        return {
            id: textbox.id,
            type: GRAPHIC_TYPES.TEXTBOX,
            origin: textbox.origin,
            text: textbox.text,
            width: textbox.dimensions.x,
            height: textbox.dimensions.y,
            size: textbox.fontSize,
            weight: textbox.fontWeight,
            font: textbox.typeface,
            rotation: textbox.rotation
        };
    }

    private _videoStoreModelToRenderer(video: VideoStoreModel): IVideoRenderer {
        const el = document.createElement('video');
        el.src = video.source;
        if (this._renderer === undefined) {
            throw new Error('Cannot convert from store model to renderer with undefined slide renderer');
        }

        return new VideoRenderer({
            id: video.id,
            slide: this._renderer,
            origin: video.origin,
            source: el,
            dimensions: new Vector(video.width, video.height),
            strokeColor: video.strokeColor,
            strokeWidth: video.strokeWidth,
            rotation: video.rotation
        });
    }

    private _videoRendererToStoreModel(video: IVideoRenderer): VideoStoreModel {
        return {
            id: video.id,
            type: GRAPHIC_TYPES.VIDEO,
            source: video.source.src,
            origin: video.origin,
            height: video.dimensions.y,
            width: video.dimensions.x,
            strokeColor: video.strokeColor,
            strokeWidth: video.strokeWidth,
            rotation: video.rotation
        };
    }
}
