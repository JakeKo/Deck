import * as SVG from 'svg.js';
import Vector from '../../utilities/Vector';

type CurveAnchorRendererArgs = {
    canvas: SVG.Doc;
    inHandle?: Vector;
    point: Vector;
    outHandle?: Vector;
};

class CurveAnchorRenderer {
    private _canvas: SVG.Doc;
    private _inHandle: Vector | undefined;
    private _point: Vector;
    private _outHandle: Vector | undefined;
    private _inHandleSvg: SVG.Rect | undefined;
    private _inHandleSpanSvg: SVG.Line | undefined;
    private _pointSvg: SVG.Ellipse | undefined;
    private _outHandleSpanSvg: SVG.Line | undefined;
    private _outHandleSvg: SVG.Rect | undefined;

    constructor(args: CurveAnchorRendererArgs) {
        this._canvas = args.canvas;
        this._inHandle = args.inHandle;
        this._point = args.point;
        this._outHandle = args.outHandle;
    }

    public get isRendered(): boolean {
        return this._pointSvg !== undefined;
    }

    public setInHandle(inHandle: Vector | undefined) {
        this._inHandle = inHandle;

        if (this._inHandle === undefined) {
            this._inHandleSvg && this._inHandleSvg.remove();
            this._inHandleSpanSvg && this._inHandleSpanSvg.remove();
            this._inHandleSvg = undefined;
            this._inHandleSpanSvg = undefined;
        } else {
            this._inHandleSvg && this._inHandleSvg.translate(this._inHandle.x - 2, this._inHandle.y - 2);
            this._inHandleSpanSvg && this._inHandleSpanSvg.plot(this._point.x, this._point.y, this._inHandle.x, this._inHandle.y);
        }
    }

    public setPoint(point: Vector) {
        this._point = point;
        this._pointSvg && this._pointSvg.translate(this._point.x, this._point.y);
    }

    public setOutHandle(outHandle: Vector | undefined) {
        this._outHandle = outHandle;

        if (this._outHandle === undefined) {
            this._outHandleSvg && this._outHandleSvg.remove();
            this._outHandleSpanSvg && this._outHandleSpanSvg.remove();
            this._outHandleSvg = undefined;
            this._outHandleSpanSvg = undefined;
        } else {
            this._outHandleSvg && this._outHandleSvg.translate(this._outHandle.x - 2, this._outHandle.y - 2);
            this._outHandleSpanSvg && this._outHandleSpanSvg.plot(this._point.x, this._point.y, this._outHandle.x, this._outHandle.y);
        }
    }

    public render(): void {
        if (this.isRendered) {
            return;
        }

        if (this._inHandle !== undefined) {
            this._inHandleSpanSvg = this._canvas.line(this._point.x, this._point.y, this._inHandle.x, this._inHandle.y)
                .stroke({
                    color: '#888888',
                    width: 1
                });

            this._inHandleSvg = this._canvas.rect(4, 4)
                .translate(this._inHandle.x - 2, this._inHandle.y - 2)
                .fill('#FFFFFF')
                .stroke({
                    color: '#888888',
                    width: 1
                });
        }

        this._pointSvg = this._canvas.ellipse(4, 4)
            .translate(this._point.x, this._point.y)
            .fill('#FFFFFF')
            .stroke({
                color: '#888888',
                width: 1
            });

        if (this._outHandle !== undefined) {
            this._outHandleSpanSvg = this._canvas.line(this._point.x, this._point.y, this._outHandle.x, this._outHandle.y)
                .stroke({
                    color: '#888888',
                    width: 1
                });

            this._outHandleSvg = this._canvas.rect(4, 4)
                .translate(this._outHandle.x - 2, this._outHandle.y - 2)
                .fill('#FFFFFF')
                .stroke({
                    color: '#888888',
                    width: 1
                });
        }
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
}

export default CurveAnchorRenderer;
