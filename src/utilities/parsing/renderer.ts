import {
    CurveRenderer,
    EllipseRenderer,
    ImageRenderer,
    RectangleRenderer,
    TextboxRenderer,
    VideoRenderer
} from '@/rendering/graphics';
import {
    CurveAnchor,
    GRAPHIC_TYPES,
    ICurveRenderer,
    IEllipseRenderer,
    IGraphicRenderer,
    IImageRenderer,
    IRectangleRenderer,
    ISlideRenderer,
    ITextboxRenderer,
    IVideoRenderer
} from '@/rendering/types';
import {
    CurveStoreModel,
    EllipseStoreModel,
    GraphicStoreModel,
    ImageStoreModel,
    RectangleStoreModel,
    TextboxStoreModel,
    VideoStoreModel
} from '@/store/types';
import Vector from '../Vector';

export function curveStoreModelToCurveRenderer(curve: CurveStoreModel, slide: ISlideRenderer): ICurveRenderer {
    try {
        return new CurveRenderer({
            id: curve.id,
            slide,
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
    } catch (error) {
        throw new Error(`Schema violation when parsing store model: ${error}`);
    }
}

export function ellipseStoreModelToEllipseRenderer(ellipse: EllipseStoreModel, slide: ISlideRenderer): IEllipseRenderer {
    try {
        return new EllipseRenderer({
            id: ellipse.id,
            slide,
            center: ellipse.center,
            dimensions: new Vector(ellipse.width, ellipse.height),
            fillColor: ellipse.fillColor,
            strokeColor: ellipse.strokeColor,
            strokeWidth: ellipse.strokeWidth,
            rotation: ellipse.rotation
        });
    } catch (error) {
        throw new Error(`Schema violation when parsing store model: ${error}`);
    }
}

export function imageStoreModelToImageRenderer(image: ImageStoreModel, slide: ISlideRenderer): IImageRenderer {
    try {
        return new ImageRenderer({
            id: image.id,
            slide,
            origin: image.origin,
            source: image.source,
            dimensions: new Vector(image.width, image.height),
            strokeColor: image.strokeColor,
            strokeWidth: image.strokeWidth,
            rotation: image.rotation
        });
    } catch (error) {
        throw new Error(`Schema violation when parsing store model: ${error}`);
    }
}

export function rectangleStoreModelToRectangleRenderer(rectangle: RectangleStoreModel, slide: ISlideRenderer): IRectangleRenderer {
    try {
        return new RectangleRenderer({
            id: rectangle.id,
            slide,
            origin: rectangle.origin,
            dimensions: new Vector(rectangle.width, rectangle.height),
            fillColor: rectangle.fillColor,
            strokeColor: rectangle.strokeColor,
            strokeWidth: rectangle.strokeWidth,
            rotation: rectangle.strokeWidth
        });
    } catch (error) {
        throw new Error(`Schema violation when parsing store model: ${error}`);
    }
}

export function textboxStoreModelToTextboxRenderer(textbox: TextboxStoreModel, slide: ISlideRenderer): ITextboxRenderer {
    try {
        return new TextboxRenderer({
            id: textbox.id,
            slide,
            text: textbox.text,
            origin: textbox.origin,
            dimensions: new Vector(textbox.width, textbox.height),
            fontSize: textbox.size,
            fontWeight: textbox.weight,
            typeface: textbox.font,
            rotation: textbox.rotation
        });
    } catch (error) {
        throw new Error(`Schema violation when parsing store model: ${error}`);
    }
}

export function videoStoreModelToVideoRenderer(video: VideoStoreModel, slide: ISlideRenderer): IVideoRenderer {
    try {
        const el = document.createElement('video');
        el.src = video.source;

        return new VideoRenderer({
            id: video.id,
            slide,
            origin: video.origin,
            source: el,
            dimensions: new Vector(video.width, video.height),
            strokeColor: video.strokeColor,
            strokeWidth: video.strokeWidth,
            rotation: video.rotation
        });
    } catch (error) {
        throw new Error(`Schema violation when parsing store model: ${error}`);
    }
}

export function graphicStoreModelToGraphicRenderer(graphic: GraphicStoreModel, slide: ISlideRenderer): IGraphicRenderer {
    if (graphic.type === GRAPHIC_TYPES.CURVE) return curveStoreModelToCurveRenderer(graphic, slide);
    if (graphic.type === GRAPHIC_TYPES.ELLIPSE) return ellipseStoreModelToEllipseRenderer(graphic, slide);
    if (graphic.type === GRAPHIC_TYPES.IMAGE) return imageStoreModelToImageRenderer(graphic, slide);
    if (graphic.type === GRAPHIC_TYPES.RECTANGLE) return rectangleStoreModelToRectangleRenderer(graphic, slide);
    if (graphic.type === GRAPHIC_TYPES.TEXTBOX) return textboxStoreModelToTextboxRenderer(graphic, slide);
    if (graphic.type === GRAPHIC_TYPES.VIDEO) return videoStoreModelToVideoRenderer(graphic, slide);
    throw new Error(`Unrecognized graphic type while parsing store model: ${graphic}`);
}
