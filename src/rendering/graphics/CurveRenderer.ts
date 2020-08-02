import * as SVG from 'svg.js';
import { decorateCurveEvents } from '../../events/decorators';
import Vector from '../../utilities/Vector';
import SlideRenderer from '../SlideRenderer';
import { BoundingBox, CurveAnchor, GraphicRenderer, GRAPHIC_TYPES } from "../types";

type CurveRendererArgs = {
    id: string;
    slide: SlideRenderer;
    anchors?: CurveAnchor[];
    fillColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
    rotation?: number;
};

class CurveRenderer implements GraphicRenderer {
    private _id: string;
    private _slide: SlideRenderer;
    private _svg: SVG.Path | undefined;
    private _anchors: CurveAnchor[];
    private _fillColor: string;
    private _strokeColor: string;
    private _strokeWidth: number;
    private _rotation: number;

    constructor(args: CurveRendererArgs) {
        this._id = args.id;
        this._slide = args.slide;
        this._anchors = args.anchors || [];
        this._fillColor = args.fillColor || 'transparent';
        this._strokeColor = args.strokeColor || '#000000';
        this._strokeWidth = args.strokeWidth || 1;
        this._rotation = args.rotation || 0;
    }

    public getId(): string {
        return this._id;
    }

    public getType(): GRAPHIC_TYPES {
        return GRAPHIC_TYPES.CURVE;
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
            .stroke({ color: this._strokeColor, width: this._strokeWidth })
            .rotate(this._rotation);
        decorateCurveEvents(this._svg, this._slide, this);
    }

    public unrender(): void {
        this._svg && this._svg.remove();
        this._svg = undefined;
    }

    public getAnchors(): CurveAnchor[] {
        return this._anchors;
    }

    public setAnchors(anchors: CurveAnchor[]): void {
        this._anchors = anchors;
        this._svg && this._svg.plot(this._getFormattedPoints());
    }

    public getAnchor(index: number): CurveAnchor {
        return this._anchors[index];
    }

    public setAnchor(index: number, anchor: CurveAnchor): void {
        this._anchors[index] = anchor;
        this._svg && this._svg.plot(this._getFormattedPoints());
    }

    public addAnchor(anchor: CurveAnchor): number {
        this._anchors.push(anchor);
        this._svg && this._svg.plot(this._getFormattedPoints());
        return this._anchors.length - 1;
    }

    public removeAnchor(index: number): void {
        this._anchors.splice(index, 1);
        this._svg && this._svg.plot(this._getFormattedPoints());
    }

    public getFillColor(): string {
        return this._fillColor;
    }

    public setFillColor(fillColor: string): void {
        this._fillColor = fillColor;
        this._svg && this._svg.fill(this._fillColor);
    }

    public getStrokeColor(): string {
        return this._strokeColor;
    }

    public setStrokeColor(strokeColor: string): void {
        this._strokeColor = strokeColor;
        this._svg && this._svg.stroke({ color: this._strokeColor, width: this._strokeWidth });
    }

    public getStrokeWidth(): number {
        return this._strokeWidth;
    }

    public setStrokeWidth(strokeWidth: number): void {
        this._strokeWidth = strokeWidth;
        this._svg && this._svg.stroke({ color: this._strokeColor, width: this._strokeWidth });
    }

    public getRotation(): number {
        return this._rotation;
    }

    public setRotation(rotation: number): void {
        this._rotation = rotation;
        this._svg && this._svg.rotate(this._rotation);
    }

    public getBoundingBox(): BoundingBox {
        if (this._svg === undefined) {
            return {
                origin: Vector.zero,
                center: Vector.zero,
                dimensions: Vector.zero
            };
        } else {
            const bbox = this._svg.bbox();
            return {
                origin: new Vector(bbox.x, bbox.y),
                center: new Vector(bbox.x, bbox.y).add(new Vector(bbox.width, bbox.height).scale(0.5)),
                dimensions: new Vector(bbox.width, bbox.height)
            };
        }
    }

    // Reformat points from an array of objects to the bezier curve string
    private _getFormattedPoints(): string {
        const anchorPoints = this._anchors.reduce<Vector[]>((points, anchor) => [...points, anchor.inHandle, anchor.point, anchor.outHandle], []);
        const [origin, ...points] = anchorPoints.slice(1, -1);
        return origin === undefined ? '' : `M ${origin.x},${origin.y} ${points.map(({ x, y }, i) => `${i % 3 === 0 ? ' C' : ''} ${x},${y}`)}`;
    }
}

export default CurveRenderer;
