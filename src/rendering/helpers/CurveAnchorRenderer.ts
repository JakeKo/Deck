import * as SVG from 'svg.js';
import { provideId } from '../../utilities/IdProvider';
import Vector from '../../utilities/Vector';
import { GraphicRenderer, GRAPHIC_TYPES } from '../types';
import SlideRenderer from '../SlideRenderer';

type CurveAnchorRendererArgs = {
    slide: SlideRenderer;
    inHandle: Vector;
    point: Vector;
    outHandle: Vector;
};

class CurveAnchorRenderer implements GraphicRenderer {
    private _id: string;
    private _type: GRAPHIC_TYPES;
    private _slide: SlideRenderer;
    private _inHandle: Vector;
    private _point: Vector;
    private _outHandle: Vector;
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
        this._id = provideId();
        this._type = GRAPHIC_TYPES.CURVE_ANCHOR;
        this._slide = args.slide;
        this._inHandle = args.inHandle;
        this._point = args.point;
        this._outHandle = args.outHandle;
        this._handleWidth = 6;
        this._handleHeight = 6;
        this._handleFillColor = '#FFFFFF';
        this._handleStrokeWidth = 1;
        this._handleStrokeColor = '#888888';
        this._pointWidth = 4;
        this._pointHeight = 4;
        this._pointFillColor = '#FFFFFF';
        this._pointStrokeWidth = 1;
        this._pointStrokeColor = '#888888';
        this._spanStrokeWidth = 1;
        this._spanStrokeColor = '#888888';
    }

    public getId(): string {
        return this._id;
    }

    public getType(): GRAPHIC_TYPES {
        return this._type;
    }

    public isRendered(): boolean {
        return this._pointSvg !== undefined;
    }

    public render(): void {
        if (this.isRendered()) {
            return;
        }

        this._inHandleSpanSvg = this._slide.canvas.line(this._point.x, this._point.y, this._inHandle.x, this._inHandle.y)
            .stroke({ color: this._spanStrokeColor, width: this._spanStrokeWidth });

        this._inHandleSvg = this._slide.canvas.rect(this._handleWidth, this._handleHeight)
            .translate(this._inHandle.x - this._handleWidth / 2, this._inHandle.y - this._handleHeight / 2)
            .fill(this._handleFillColor)
            .stroke({ color: this._handleStrokeColor, width: this._handleStrokeWidth });

        this._outHandleSpanSvg = this._slide.canvas.line(this._point.x, this._point.y, this._outHandle.x, this._outHandle.y)
            .stroke({ color: this._spanStrokeColor, width: this._spanStrokeWidth });

        this._outHandleSvg = this._slide.canvas.rect(this._handleWidth, this._handleHeight)
            .translate(this._outHandle.x - this._handleWidth / 2, this._outHandle.y - this._handleHeight / 2)
            .fill(this._handleFillColor)
            .stroke({ color: this._handleStrokeColor, width: this._handleStrokeWidth });

        this._pointSvg = this._slide.canvas.ellipse(this._pointWidth, this._pointHeight)
            .translate(this._point.x - this._pointWidth / 2, this._point.y - this._pointHeight / 2)
            .fill(this._pointFillColor)
            .stroke({ color: this._pointStrokeColor, width: this._pointStrokeWidth });
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

    public setInHandle(inHandle: Vector) {
        this._inHandle = inHandle;
        this._inHandleSvg && this._inHandleSvg.translate(this._inHandle.x - this._handleWidth / 2, this._inHandle.y - this._handleHeight / 2);
        this._inHandleSpanSvg && this._inHandleSpanSvg.plot(this._point.x, this._point.y, this._inHandle.x, this._inHandle.y);
    }

    public setPoint(point: Vector) {
        this._point = point;
        this._pointSvg && this._pointSvg.translate(this._point.x - this._pointWidth / 2, this._point.y - this._pointHeight / 2);
    }

    public setOutHandle(outHandle: Vector) {
        this._outHandle = outHandle;
        this._outHandleSvg && this._outHandleSvg.translate(this._outHandle.x - this._handleWidth / 2, this._outHandle.y - this._handleHeight / 2);
        this._outHandleSpanSvg && this._outHandleSpanSvg.plot(this._point.x, this._point.y, this._outHandle.x, this._outHandle.y);
    }
}

export default CurveAnchorRenderer;
