import {
    GRAPHIC_TYPES,
    ICurveRenderer,
    IEllipseRenderer,
    IGraphicRenderer,
    IImageRenderer,
    IRectangleRenderer,
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

export function curveRendererToCurveStoreModel(curve: ICurveRenderer): CurveStoreModel {
    try {
        return {
            id: curve.id,
            type: curve.type,
            points: curve.anchors.reduce<Vector[]>((points, anchor) => [...points, anchor.inHandle, anchor.point, anchor.outHandle], []),
            fillColor: curve.fillColor,
            strokeColor: curve.strokeColor,
            strokeWidth: curve.strokeWidth,
            rotation: curve.rotation
        };
    } catch (error) {
        throw new Error(`Schema violation when parsing renderer: ${error}`);
    }
}

export function ellipseRendererToEllipseStoreModel(ellipse: IEllipseRenderer): EllipseStoreModel {
    try {
        return {
            id: ellipse.id,
            type: ellipse.type,
            center: ellipse.center,
            width: ellipse.dimensions.x,
            height: ellipse.dimensions.y,
            fillColor: ellipse.fillColor,
            strokeColor: ellipse.strokeColor,
            strokeWidth: ellipse.strokeWidth,
            rotation: ellipse.rotation
        };
    } catch (error) {
        throw new Error(`Schema violation when parsing renderer: ${error}`);
    }
}

export function imageRendererToImageStoreModel(image: IImageRenderer): ImageStoreModel {
    try {
        return {
            id: image.id,
            type: image.type,
            source: image.source,
            origin: image.origin,
            height: image.dimensions.y,
            width: image.dimensions.x,
            strokeColor: image.strokeColor,
            strokeWidth: image.strokeWidth,
            rotation: image.rotation
        };
    } catch (error) {
        throw new Error(`Schema violation when parsing renderer: ${error}`);
    }
}

export function rectangleRendererToRectangleStoreModel(rectangle: IRectangleRenderer): RectangleStoreModel {
    try {
        return {
            id: rectangle.id,
            type: rectangle.type,
            origin: rectangle.origin,
            width: rectangle.dimensions.x,
            height: rectangle.dimensions.y,
            fillColor: rectangle.fillColor,
            strokeColor: rectangle.strokeColor,
            strokeWidth: rectangle.strokeWidth,
            rotation: rectangle.rotation
        };
    } catch (error) {
        throw new Error(`Schema violation when parsing renderer: ${error}`);
    }
}

export function textboxRendererToTextboxStoreModel(textbox: ITextboxRenderer): TextboxStoreModel {
    try {
        return {
            id: textbox.id,
            type: textbox.type,
            origin: textbox.origin,
            text: textbox.text,
            width: textbox.dimensions.x,
            height: textbox.dimensions.y,
            size: textbox.fontSize,
            weight: textbox.fontWeight,
            font: textbox.typeface,
            rotation: textbox.rotation
        };
    } catch (error) {
        throw new Error(`Schema violation when parsing renderer: ${error}`);
    }
}

export function videoRendererToVideoStoreModel(video: IVideoRenderer): VideoStoreModel {
    try {
        return {
            id: video.id,
            type: video.type,
            source: video.source.src,
            origin: video.origin,
            height: video.dimensions.y,
            width: video.dimensions.x,
            strokeColor: video.strokeColor,
            strokeWidth: video.strokeWidth,
            rotation: video.rotation
        };
    } catch (error) {
        throw new Error(`Schema violation when parsing renderer: ${error}`);
    }
}

export function graphicRendererToGraphicStoreModel(graphic: IGraphicRenderer): GraphicStoreModel {
    if (graphic.type === GRAPHIC_TYPES.CURVE) return curveRendererToCurveStoreModel(graphic);
    if (graphic.type === GRAPHIC_TYPES.ELLIPSE) return ellipseRendererToEllipseStoreModel(graphic);
    if (graphic.type === GRAPHIC_TYPES.IMAGE) return imageRendererToImageStoreModel(graphic);
    if (graphic.type === GRAPHIC_TYPES.RECTANGLE) return rectangleRendererToRectangleStoreModel(graphic);
    if (graphic.type === GRAPHIC_TYPES.TEXTBOX) return textboxRendererToTextboxStoreModel(graphic);
    if (graphic.type === GRAPHIC_TYPES.VIDEO) return videoRendererToVideoStoreModel(graphic);
    throw new Error(`Unrecognized graphic type while parsing renderer: ${graphic}`);
}

export function jsonToSlides(json: string): { id: string; graphics: { [key: string]: GraphicStoreModel } }[] {
    try {
        return JSON.parse(json);
    } catch (error) {
        throw new Error(`Schema violation when parsing json into slides: ${json}`);
    }
}
