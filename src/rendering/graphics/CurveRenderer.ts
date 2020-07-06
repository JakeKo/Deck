import * as SVG from 'svg.js';
import Vector from '../../utilities/Vector';
import SlideRenderer from '../SlideRenderer';
import { CurveAnchor, GraphicRenderer, GRAPHIC_TYPES } from "../types";
import { decorateCurveEvents } from '../utilities';

type CurveRendererArgs = {
    id: string;
    slideRenderer: SlideRenderer;
    anchors?: CurveAnchor[];
    fillColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
    rotation?: number;
};

// TODO: Change _slideRenderer to _slide
class CurveRenderer implements GraphicRenderer {
    private _id: string;
    private _slideRenderer: SlideRenderer;
    private _svg: SVG.Path | undefined;
    private _type: GRAPHIC_TYPES;
    private _anchors: CurveAnchor[];
    private _fillColor: string;
    private _strokeColor: string;
    private _strokeWidth: number;
    private _rotation: number;

    constructor(args: CurveRendererArgs) {
        this._id = args.id;
        this._slideRenderer = args.slideRenderer;
        this._type = GRAPHIC_TYPES.CURVE;
        this._anchors = args.anchors || [];
        this._fillColor = args.fillColor ||'transparent';
        this._strokeColor = args.strokeColor || '#000000';
        this._strokeWidth = args.strokeWidth || 1;
        this._rotation = args.rotation || 0;
    }

    public get id(): string {
        return this._id;
    }

    public get type(): GRAPHIC_TYPES {
        return this._type;
    }

    public get isRendered(): boolean {
        return this._svg !== undefined;
    }

    public move(origin: Vector): void {
        const changeInPosition = this._anchors[0].point.towards(origin);
        this._anchors = this._anchors.map(anchor => ({
            inHandle: anchor.inHandle.add(changeInPosition),
            point: anchor.point.add(changeInPosition),
            outHandle: anchor.outHandle.add(changeInPosition)
        }));
        this._svg && this._svg.plot(this._formattedPoints);
    }

    public addAnchor(anchor: CurveAnchor): number {
        this._anchors.push(anchor);
        this._svg && this._svg.plot(this._formattedPoints);
        return this._anchors.length - 1;
    }

    public setAnchor(index: number, anchor: CurveAnchor): void {
        this._anchors[index] = anchor;
        this._svg && this._svg.plot(this._formattedPoints);
    }

    public removeAnchor(index: number): void {
        this._anchors.splice(index, 1);
        this._svg && this._svg.plot(this._formattedPoints);
    }

    public getAnchors(): CurveAnchor[] {
        return this._anchors;
    }

    // TODO: Convert setters to functions
    // TODO: Create getter functions
    public set fillColor(fillColor: string) {
        this._fillColor = fillColor;
        this._svg && this._svg.fill(this._fillColor);
    }

    public set strokeColor(strokeColor: string) {
        this._strokeColor = strokeColor;
        this._svg && this._svg.stroke({ color: this._strokeColor, width: this._strokeWidth });
    }

    public set strokeWidth(strokeWidth: number) {
        this._strokeWidth = strokeWidth;
        this._svg && this._svg.stroke({ color: this._strokeColor, width: this._strokeWidth });
    }

    public set rotation(rotation: number) {
        this._rotation = rotation;
        this._svg && this._svg.rotate(this._rotation);
    }

    public render(): void {
        // Silently fail if the SVG is already rendered
        if (this.isRendered) {
            return;
        }

        this._svg = this._slideRenderer.canvas.path(this._formattedPoints)
            .fill(this._fillColor)
            .stroke({ color: this._strokeColor, width: this._strokeWidth })
            .rotate(this._rotation);
        decorateCurveEvents(this._svg, this._slideRenderer, this);
    }

    public unrender(): void {
        this._svg && this._svg.remove();
        this._svg = undefined;
    }

    // Reformat points from an array of objects to the bezier curve string
    private get _formattedPoints(): string {
        const anchorPoints = this._anchors.reduce<Vector[]>((points, anchor) => [...points, anchor.inHandle, anchor.point, anchor.outHandle], []);
        const [origin, ...points] = anchorPoints.slice(1, -1);
        return origin === undefined ? '' : `M ${origin.x},${origin.y} ${points.map(({ x, y }, i) => `${i % 3 === 0 ? ' C' : ''} ${x},${y}`)}`;
    }
}

export default CurveRenderer;
