import * as SVG from 'svg.js';
import Vector from '../../utilities/Vector';
import SlideRenderer from '../SlideRenderer';
import { CurveAnchor, GRAPHIC_TYPES, HelperRenderer } from "../types";

type CurveOutlineRendererArgs = {
    slide: SlideRenderer;
    anchors: CurveAnchor[];
    scale: number;
};

class CurveOutlineRenderer implements HelperRenderer {
    private _slide: SlideRenderer;
    private _svg: SVG.Path | undefined;
    private _anchors: CurveAnchor[];
    private _fillColor: string;
    private _strokeColor: string;
    private _strokeWidth: number;
    private _rotation: number;
    private _scale: number;

    constructor(args: CurveOutlineRendererArgs) {
        this._slide = args.slide;
        this._anchors = args.anchors;
        this._fillColor = 'none';
        this._strokeColor = '#400c8b';
        this._strokeWidth = 1;
        this._rotation = 0;
        this._scale = args.scale;
    }

    public getType(): GRAPHIC_TYPES {
        return GRAPHIC_TYPES.CURVE_OUTLINE;
    }

    public isRendered(): boolean {
        return this._svg !== undefined;
    }

    public render(): void {
        // Silently fail if the SVG is already rendered
        if (this.isRendered()) {
            return;
        }

        this._svg = this._slide.canvas.path(this._getFormattedPoints())
            .fill(this._fillColor)
            .stroke({ color: this._strokeColor, width: this._strokeWidth * this._scale })
            .rotate(this._rotation);
    }

    public unrender(): void {
        this._svg && this._svg.remove();
        this._svg = undefined;
    }

    public setScale(scale: number): void {
        this._scale = scale;
        this._svg && this._svg.stroke({ color: this._strokeColor, width: this._strokeWidth * this._scale });
    }

    // Reformat points from an array of objects to the bezier curve string
    private _getFormattedPoints(): string {
        const anchorPoints = this._anchors.reduce<Vector[]>((points, anchor) => [...points, anchor.inHandle, anchor.point, anchor.outHandle], []);
        const [origin, ...points] = anchorPoints.slice(1, -1);
        return origin === undefined ? '' : `M ${origin.x},${origin.y} ${points.map(({ x, y }, i) => `${i % 3 === 0 ? ' C' : ''} ${x},${y}`)}`;
    }
}

export default CurveOutlineRenderer;