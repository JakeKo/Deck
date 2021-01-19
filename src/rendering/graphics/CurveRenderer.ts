import { decorateCurveEvents } from '@/events/decorators';
import SnapVector from '@/utilities/SnapVector';
import { radToDeg } from '@/utilities/utilities';
import Vector from '@/utilities/Vector';
import SVG from 'svg.js';
import { BoundingBox, CurveAnchor, GRAPHIC_TYPES, ICurveRenderer, ISlideRenderer } from '../types';

class CurveRenderer implements ICurveRenderer {
    public readonly id: string;
    public readonly type = GRAPHIC_TYPES.CURVE;
    private _slide: ISlideRenderer;
    private _svg: SVG.Path | undefined;
    private _anchors: CurveAnchor[];
    private _fillColor: string;
    private _strokeColor: string;
    private _strokeWidth: number;
    private _rotation: number;

    constructor(args: {
        id: string;
        slide: ISlideRenderer;
        anchors?: CurveAnchor[];
        fillColor?: string;
        strokeColor?: string;
        strokeWidth?: number;
        rotation?: number;
    }) {
        this.id = args.id;
        this._slide = args.slide;
        this._anchors = args.anchors || [];
        this._fillColor = args.fillColor || 'transparent';
        this._strokeColor = args.strokeColor || '#000000';
        this._strokeWidth = args.strokeWidth || 1;
        this._rotation = args.rotation || 0;
    }

    public get isRendered(): boolean {
        return this._svg !== undefined;
    }

    public get anchors(): CurveAnchor[] {
        return this._anchors;
    }

    public set anchors(anchors: CurveAnchor[]) {
        this._anchors = anchors;
        this._svg && this._svg.rotate(0).plot(this._getFormattedPoints()).rotate(radToDeg(this._rotation));
    }

    public get fillColor(): string {
        return this._fillColor;
    }

    public set fillColor(fillColor: string) {
        this._fillColor = fillColor;
        this._svg && this._svg.fill(this._fillColor);
    }

    public get strokeColor(): string {
        return this._strokeColor;
    }

    public set strokeColor(strokeColor: string) {
        this._strokeColor = strokeColor;
        this._svg && this._svg.stroke({ color: this._strokeColor, width: this._strokeWidth });
    }

    public get strokeWidth(): number {
        return this._strokeWidth;
    }

    public set strokeWidth(strokeWidth: number) {
        this._strokeWidth = strokeWidth;
        this._svg && this._svg.stroke({ color: this._strokeColor, width: this._strokeWidth });
    }

    public get rotation(): number {
        return this._rotation;
    }

    public set rotation(rotation: number) {
        this._rotation = rotation;
        this._svg && this._svg.rotate(radToDeg(this._rotation));
    }

    public get staticBox(): BoundingBox {
        if (this._svg === undefined) {
            return {
                origin: Vector.zero,
                center: Vector.zero,
                dimensions: Vector.zero,
                topLeft: Vector.zero,
                topRight: Vector.zero,
                bottomLeft: Vector.zero,
                bottomRight: Vector.zero,
                rotation: 0
            };
        }

        const bbox = this._svg.bbox();
        return {
            origin: new Vector(bbox.x, bbox.y),
            center: new Vector(bbox.x, bbox.y).add(new Vector(bbox.width, bbox.height).scale(0.5)),
            dimensions: new Vector(bbox.width, bbox.height),
            topLeft: new Vector(bbox.x, bbox.y),
            topRight: new Vector(bbox.x + bbox.width, bbox.y),
            bottomLeft: new Vector(bbox.x, bbox.y + bbox.height),
            bottomRight: new Vector(bbox.x + bbox.width, bbox.y + bbox.height),
            rotation: this._rotation
        };
    }

    public get transformedBox(): BoundingBox {
        if (this._svg === undefined) {
            return this.staticBox;
        }

        const staticBox = this.staticBox;
        const corners = {
            topLeft: staticBox.center.towards(staticBox.topLeft),
            topRight: staticBox.center.towards(staticBox.topRight),
            bottomLeft: staticBox.center.towards(staticBox.bottomLeft),
            bottomRight: staticBox.center.towards(staticBox.bottomRight)
        };

        return {
            origin: staticBox.origin,
            center: staticBox.center,
            dimensions: staticBox.dimensions,
            topLeft: staticBox.center.add(corners.topLeft.rotateMore(staticBox.rotation)),
            topRight: staticBox.center.add(corners.topRight.rotateMore(staticBox.rotation)),
            bottomLeft: staticBox.center.add(corners.bottomLeft.rotateMore(staticBox.rotation)),
            bottomRight: staticBox.center.add(corners.bottomRight.rotateMore(staticBox.rotation)),
            rotation: staticBox.rotation
        };
    }

    // Get the points by which a graphic can be pulled to snap to existing snap vectors
    // These points are based on the transformed shape (unlike snap vectors which distinquish static and transformed)
    public get pullPoints(): Vector[] {
        const box = this.transformedBox;
        return [
            box.topLeft.add(box.topLeft.towards(box.topRight).scale(0.5)),
            box.topRight.add(box.topRight.towards(box.bottomRight).scale(0.5)),
            box.bottomRight.add(box.bottomRight.towards(box.bottomLeft).scale(0.5)),
            box.bottomLeft.add(box.bottomLeft.towards(box.topLeft).scale(0.5))
        ];
    }

    public get staticSnapVectors(): SnapVector[] {
        const box = this.staticBox;
        return [
            new SnapVector(box.center, Vector.north),
            new SnapVector(box.center, Vector.east)
        ];
    }

    public get transformedSnapVectors(): SnapVector[] {
        const box = this.transformedBox;
        const topCenter = box.topLeft.add(box.topLeft.towards(box.topRight).scale(0.5));
        const leftCenter = box.topRight.add(box.topRight.towards(box.bottomRight).scale(0.5));
        const bottomCenter = box.bottomRight.add(box.bottomRight.towards(box.bottomLeft).scale(0.5));
        const rightCenter = box.bottomLeft.add(box.bottomLeft.towards(box.topLeft).scale(0.5));

        return [
            new SnapVector(topCenter, Vector.east.rotateMore(box.rotation)),
            new SnapVector(leftCenter, Vector.north.rotateMore(box.rotation)),
            new SnapVector(bottomCenter, Vector.east.rotateMore(box.rotation)),
            new SnapVector(rightCenter, Vector.north.rotateMore(box.rotation)),
            new SnapVector(box.center, Vector.east.rotateMore(-box.rotation)),
            new SnapVector(box.center, Vector.north.rotateMore(-box.rotation))
        ];
    }

    public getAnchor(index: number): CurveAnchor {
        return this._anchors[index];
    }

    public setAnchor(index: number, anchor: CurveAnchor): void {
        this._anchors[index] = anchor;
        this._svg && this._svg.rotate(0).plot(this._getFormattedPoints()).rotate(radToDeg(this._rotation));
    }

    public addAnchor(anchor: CurveAnchor): number {
        this._anchors.push(anchor);
        this._svg && this._svg.rotate(0).plot(this._getFormattedPoints()).rotate(radToDeg(this._rotation));
        return this._anchors.length - 1;
    }

    public removeAnchor(index: number): void {
        this._anchors.splice(index, 1);
        this._svg && this._svg.rotate(0).plot(this._getFormattedPoints()).rotate(radToDeg(this._rotation));
    }

    public render(): void {
        // Silently fail if the SVG is already rendered
        if (this.isRendered) {
            return;
        }

        this._svg = this._slide.canvas.path(this._getFormattedPoints())
            .fill(this._fillColor)
            .stroke({ color: this._strokeColor, width: this._strokeWidth })
            .rotate(radToDeg(this._rotation));
        decorateCurveEvents(this._svg, this._slide, this);
    }

    public unrender(): void {
        this._svg && this._svg.remove();
        this._svg = undefined;
    }

    // Reformat points from an array of objects to the bezier curve string
    private _getFormattedPoints(): string {
        const anchorPoints = this._anchors.reduce<Vector[]>((points, anchor) => [...points, anchor.inHandle, anchor.point, anchor.outHandle], []);
        const [origin, ...points] = anchorPoints.slice(1, -1);
        return origin === undefined ? '' : `M ${origin.x},${origin.y} ${points.map(({ x, y }, i) => `${i % 3 === 0 ? ' C' : ''} ${x},${y}`)}`;
    }
}

export default CurveRenderer;
