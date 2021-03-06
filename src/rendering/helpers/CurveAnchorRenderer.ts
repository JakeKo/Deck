import { decorateCurveAnchorEvents } from '@/events/decorators';
import V from '@/utilities/Vector';
import SVG from 'svg.js';
import { CURVE_ANCHOR_ROLES, GRAPHIC_TYPES, ICurveAnchorRenderer, ISlideRenderer } from '../types';

type CurveAnchorRendererArgs = {
    slide: ISlideRenderer;
    scale: number;
    inHandle: V;
    point: V;
    outHandle: V;
    parentId: string;
    index: number;
};

class CurveAnchorRenderer implements ICurveAnchorRenderer {
    public readonly type = GRAPHIC_TYPES.CURVE_ANCHOR;
    private _slide: ISlideRenderer;
    private _parentId: string;
    private _index: number;
    private _scale: number;
    private _inHandle: V;
    private _point: V;
    private _outHandle: V;
    private _inHandleSvg: SVG.Rect | undefined;
    private _inHandleSpanSvg: SVG.Line | undefined;
    private _pointSvg: SVG.Ellipse | undefined;
    private _outHandleSpanSvg: SVG.Line | undefined;
    private _outHandleSvg: SVG.Rect | undefined;
    private _handleWidth: number;
    private _handleHeight: number;
    private _handleFillColor: string;
    private _handleStrokeWidth: number;
    private _handleStrokeColor: string;
    private _pointWidth: number;
    private _pointHeight: number;
    private _pointFillColor: string;
    private _pointStrokeWidth: number;
    private _pointStrokeColor: string;
    private _spanStrokeWidth: number;
    private _spanStrokeColor: string;

    constructor(args: CurveAnchorRendererArgs) {
        this._slide = args.slide;
        this._parentId = args.parentId;
        this._index = args.index;
        this._scale = args.scale;
        this._inHandle = args.inHandle;
        this._point = args.point;
        this._outHandle = args.outHandle;
        this._handleWidth = 8;
        this._handleHeight = 8;
        this._handleFillColor = '#400c8b';
        this._handleStrokeWidth = 0;
        this._handleStrokeColor = 'none';
        this._pointWidth = 8;
        this._pointHeight = 8;
        this._pointFillColor = '#400c8b';
        this._pointStrokeWidth = 0;
        this._pointStrokeColor = 'none';
        this._spanStrokeWidth = 1;
        this._spanStrokeColor = '#400c8b';
    }

    public get isRendered(): boolean {
        return this._pointSvg !== undefined;
    }

    public set inHandle(inHandle: V) {
        this._inHandle = inHandle;

        const position = this._handlePosition(this._inHandle);
        this._inHandleSvg && this._inHandleSvg.translate(position.x, position.y);
        this._inHandleSpanSvg && this._inHandleSpanSvg.plot(this._point.x, this._point.y, this._inHandle.x, this._inHandle.y);
    }

    public set point(point: V) {
        this._point = point;

        const position = this._pointPosition();
        this._pointSvg && this._pointSvg.translate(position.x, position.y);
    }

    public set outHandle(outHandle: V) {
        this._outHandle = outHandle;

        const position = this._handlePosition(this._outHandle);
        this._outHandleSvg && this._outHandleSvg.translate(position.x, position.y);
        this._outHandleSpanSvg && this._outHandleSpanSvg.plot(this._point.x, this._point.y, this._outHandle.x, this._outHandle.y);
    }

    public set scale(scale: number) {
        this._scale = scale;

        const handleDimensions = this._handleDimensions();
        const inHandlePosition = this._handlePosition(this._inHandle);
        const outHandlePosition = this._handlePosition(this._outHandle);
        const pointDimensions = this._pointDimensions();
        const pointPosition = this._pointPosition();

        this._inHandleSpanSvg && this._inHandleSpanSvg.stroke({ color: this._spanStrokeColor, width: this._spanStrokeWidth * this._scale });
        this._outHandleSpanSvg && this._outHandleSpanSvg.stroke({ color: this._spanStrokeColor, width: this._spanStrokeWidth * this._scale });
        this._inHandleSvg && this._inHandleSvg.size(handleDimensions.x, handleDimensions.y).translate(inHandlePosition.x, inHandlePosition.y);
        this._outHandleSvg && this._outHandleSvg.size(handleDimensions.x, handleDimensions.y).translate(outHandlePosition.x, outHandlePosition.y);
        this._pointSvg && this._pointSvg.size(pointDimensions.x, pointDimensions.y).translate(pointPosition.x, pointPosition.y);
    }

    public render(): void {
        if (this.isRendered) {
            return;
        }

        const handleDimensions = this._handleDimensions();
        const inHandlePosition = this._handlePosition(this._inHandle);
        const outHandlePosition = this._handlePosition(this._outHandle);
        const pointDimensions = this._pointDimensions();
        const pointPosition = this._pointPosition();

        this._inHandleSpanSvg = this._slide.canvas.line(this._point.x, this._point.y, this._inHandle.x, this._inHandle.y)
            .stroke({ color: this._spanStrokeColor, width: this._spanStrokeWidth * this._scale });
        this._outHandleSpanSvg = this._slide.canvas.line(this._point.x, this._point.y, this._outHandle.x, this._outHandle.y)
            .stroke({ color: this._spanStrokeColor, width: this._spanStrokeWidth * this._scale });
        this._inHandleSvg = this._slide.canvas.rect(handleDimensions.x, handleDimensions.y)
            .translate(inHandlePosition.x, inHandlePosition.y)
            .fill(this._handleFillColor)
            .stroke({ color: this._handleStrokeColor, width: this._handleStrokeWidth });
        this._outHandleSvg = this._slide.canvas.rect(handleDimensions.x, handleDimensions.y)
            .translate(outHandlePosition.x, outHandlePosition.y)
            .fill(this._handleFillColor)
            .stroke({ color: this._handleStrokeColor, width: this._handleStrokeWidth });
        this._pointSvg = this._slide.canvas.ellipse(pointDimensions.x, pointDimensions.y)
            .translate(pointPosition.x, pointPosition.y)
            .fill(this._pointFillColor)
            .stroke({ color: this._pointStrokeColor, width: this._pointStrokeWidth });

        decorateCurveAnchorEvents(this._inHandleSvg, this._slide, this, this._parentId, this._index, CURVE_ANCHOR_ROLES.IN_HANDLE);
        decorateCurveAnchorEvents(this._pointSvg, this._slide, this, this._parentId, this._index, CURVE_ANCHOR_ROLES.POINT);
        decorateCurveAnchorEvents(this._outHandleSvg, this._slide, this, this._parentId, this._index, CURVE_ANCHOR_ROLES.OUT_HANDLE);
    }

    public unrender(): void {
        this._inHandleSvg && this._inHandleSvg.remove();
        this._inHandleSpanSvg && this._inHandleSpanSvg.remove();
        this._pointSvg && this._pointSvg.remove();
        this._outHandleSvg && this._outHandleSvg.remove();
        this._outHandleSpanSvg && this._outHandleSpanSvg.remove();

        this._inHandleSvg = undefined;
        this._inHandleSpanSvg = undefined;
        this._pointSvg = undefined;
        this._outHandleSvg = undefined;
        this._outHandleSpanSvg = undefined;
    }

    private _handleDimensions(): V {
        return new V(this._handleWidth, this._handleHeight).scale(this._scale);
    }

    private _handlePosition(origin: V): V {
        const dimensions = this._handleDimensions();
        return origin.add(dimensions.scale(-0.5));
    }

    private _pointDimensions(): V {
        return new V(this._pointWidth, this._pointHeight).scale(this._scale);
    }

    private _pointPosition(): V {
        const dimensions = this._pointDimensions();
        return this._point.add(dimensions.scale(-0.5));
    }
}

export default CurveAnchorRenderer;
