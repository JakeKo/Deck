import { CurveRenderer, EllipseRenderer, ImageRenderer, RectangleRenderer, TextboxRenderer, VideoRenderer } from "../rendering/graphics";
import SlideRenderer from "../rendering/SlideRenderer";
import { CurveAnchor, GraphicRenderer, GRAPHIC_TYPES } from "../rendering/types";
import { AppStore, CurveStoreModel, EllipseStoreModel, GraphicStoreModel, ImageStoreModel, MUTATIONS, RectangleStoreModel, TextboxStoreModel, VideoStoreModel } from "../store/types";
import Vector from "./Vector";

export default class SlideStateManager {
    private _slideId: string;
    private _store: AppStore | undefined;
    private _renderer: SlideRenderer | undefined;

    constructor(slideId: string) {
        this._slideId = slideId;
    }

    private _curveStoreModelToRenderer(curve: CurveStoreModel): CurveRenderer {
        return new CurveRenderer({
            id: curve.id,
            slide: this._renderer!,
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

    private _curveRendererToStoreModel(curve: CurveRenderer): CurveStoreModel {
        return {
            id: curve.getId(),
            type: GRAPHIC_TYPES.CURVE,
            points: curve.getAnchors().reduce<Vector[]>((points, anchor) => [...points, anchor.inHandle, anchor.point, anchor.outHandle], []),
            fillColor: curve.getFillColor(),
            strokeColor: curve.getStrokeColor(),
            strokeWidth: curve.getStrokeWidth(),
            rotation: curve.getRotation()
        };
    }

    private _ellipseStoreModelToRenderer(ellipse: EllipseStoreModel): EllipseRenderer {
        return new EllipseRenderer({
            id: ellipse.id,
            slide: this._renderer!,
            center: ellipse.center,
            width: ellipse.width,
            height: ellipse.height,
            fillColor: ellipse.fillColor,
            strokeColor: ellipse.strokeColor,
            strokeWidth: ellipse.strokeWidth,
            rotation: ellipse.strokeWidth
        });
    }

    private _ellipseRendererToStoreModel(ellipse: EllipseRenderer): EllipseStoreModel {
        return {
            id: ellipse.getId(),
            type: GRAPHIC_TYPES.ELLIPSE,
            center: ellipse.getCenter(),
            width: ellipse.getWidth(),
            height: ellipse.getHeight(),
            fillColor: ellipse.getFillColor(),
            strokeColor: ellipse.getStrokeColor(),
            strokeWidth: ellipse.getStrokeWidth(),
            rotation: ellipse.getRotation()
        };
    }

    private _imageStoreModelToRenderer(image: ImageStoreModel): ImageRenderer {
        return new ImageRenderer({
            id: image.id,
            slide: this._renderer!,
            origin: image.origin,
            source: image.source,
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
            source: image.getSource(),
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
            slide: this._renderer!,
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

    private _textboxStoreModelToRenderer(textbox: TextboxStoreModel): TextboxRenderer {
        return new TextboxRenderer({
            id: textbox.id,
            slide: this._renderer!,
            text: textbox.text,
            origin: textbox.origin,
            width: textbox.width,
            height: textbox.height,
            size: textbox.size,
            weight: textbox.weight,
            font: textbox.font,
            rotation: textbox.rotation
        });
    }

    private _textboxRendererToStoreModel(textbox: TextboxRenderer): TextboxStoreModel {
        return {
            id: textbox.getId(),
            type: GRAPHIC_TYPES.TEXTBOX,
            origin: textbox.getOrigin(),
            text: textbox.getText(),
            width: textbox.getWidth(),
            height: textbox.getHeight(),
            size: textbox.getSize(),
            weight: textbox.getWeight(),
            font: textbox.getFont(),
            rotation: textbox.getRotation()
        };
    }

    private _videoStoreModelToRenderer(video: VideoStoreModel): VideoRenderer {
        const el = document.createElement('video');
        el.src = video.source;
        return new VideoRenderer({
            id: video.id,
            slide: this._renderer!,
            origin: video.origin,
            source: el,
            width: video.width,
            height: video.height,
            strokeColor: video.strokeColor,
            strokeWidth: video.strokeWidth,
            rotation: video.rotation
        });
    }

    private _videoRendererToStoreModel(video: VideoRenderer): VideoStoreModel {
        return {
            id: video.getId(),
            type: GRAPHIC_TYPES.VIDEO,
            source: video.getSource().src,
            origin: video.getOrigin(),
            height: video.getHeight(),
            width: video.getWidth(),
            strokeColor: video.getStrokeColor(),
            strokeWidth: video.getStrokeWidth(),
            rotation: video.getRotation()
        };
    }

    public setStore(store: AppStore): void {
        this._store = store;
    }

    public setRenderer(renderer: SlideRenderer): void {
        this._renderer = renderer;
    }

    public setGraphicFromRenderer(graphic: GraphicRenderer): void {
        if (graphic.getType() === GRAPHIC_TYPES.CURVE) {
            const storeModel = this._curveRendererToStoreModel(graphic as CurveRenderer);
            this._store && this._store.commit(MUTATIONS.SET_GRAPHIC, { slide: this._slideId, graphic: storeModel });
        } else if (graphic.getType() === GRAPHIC_TYPES.ELLIPSE) {
            const storeModel = this._ellipseRendererToStoreModel(graphic as EllipseRenderer);
            this._store && this._store.commit(MUTATIONS.SET_GRAPHIC, { slide: this._slideId, graphic: storeModel });
        } else if (graphic.getType() === GRAPHIC_TYPES.IMAGE) {
            const storeModel = this._imageRendererToStoreModel(graphic as ImageRenderer);
            this._store && this._store.commit(MUTATIONS.SET_GRAPHIC, { slide: this._slideId, graphic: storeModel });
        } else if (graphic.getType() === GRAPHIC_TYPES.RECTANGLE) {
            const storeModel = this._rectangleRendererToStoreModel(graphic as RectangleRenderer);
            this._store && this._store.commit(MUTATIONS.SET_GRAPHIC, { slide: this._slideId, graphic: storeModel });
        } else if (graphic.getType() === GRAPHIC_TYPES.TEXTBOX) {
            const storeModel = this._textboxRendererToStoreModel(graphic as TextboxRenderer);
            this._store && this._store.commit(MUTATIONS.SET_GRAPHIC, { slide: this._slideId, graphic: storeModel });
        } else if (graphic.getType() === GRAPHIC_TYPES.VIDEO) {
            const storeModel = this._videoRendererToStoreModel(graphic as VideoRenderer);
            this._store && this._store.commit(MUTATIONS.SET_GRAPHIC, { slide: this._slideId, graphic: storeModel });
        }
    }

    public removeGraphicFromRenderer(graphicId: string): void {
        this._store && this._store.commit(MUTATIONS.REMOVE_GRAPHIC, {
            slideId: this._slideId,
            graphicId
        });
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
}
