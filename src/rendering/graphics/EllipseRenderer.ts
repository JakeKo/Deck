import { decorateEllipseEvents } from '@/events/decorators';
import SnapVector from '@/utilities/SnapVector';
import { radToDeg } from '@/utilities/utilities';
import Vector from '@/utilities/Vector';
import SVG from 'svg.js';
import { BoundingBox, GRAPHIC_TYPES, IEllipseRenderer, ISlideRenderer } from '../types';

class EllipseRenderer implements IEllipseRenderer {
    public readonly id: string;
    public readonly type = GRAPHIC_TYPES.ELLIPSE;
    private _slide: ISlideRenderer;
    private _svg: SVG.Ellipse | undefined;
    private _center: Vector;
    private _dimensions: Vector;
    private _fillColor: string;
    private _strokeColor: string;
    private _strokeWidth: number;
    private _rotation: number;

    constructor(args: {
        id: string;
        slide: ISlideRenderer;
        center?: Vector;
        dimensions?: Vector;
        fillColor?: string;
        strokeColor?: string;
        strokeWidth?: number;
        rotation?: number;
    }) {
        this.id = args.id;
        this._slide = args.slide;
        this._center = args.center || Vector.zero;
        this._dimensions = args.dimensions || Vector.zero;
        this._fillColor = args.fillColor || '#CCCCCC';
        this._strokeColor = args.strokeColor || 'none';
        this._strokeWidth = args.strokeWidth || 0;
        this._rotation = args.rotation || 0;
    }

    public get isRendered(): boolean {
        return this._svg !== undefined;
    }

    public get center(): Vector {
        return this._center;
    }

    public set center(origin: Vector) {
        this._center = origin;
        this._svg && this._svg.rotate(0).center(this._center.x, this._center.y).rotate(radToDeg(this._rotation));
    }

    public get dimensions(): Vector {
        return this._dimensions;
    }

    public set dimensions(dimensions: Vector) {
        this._dimensions = dimensions;
        this._svg && this._svg.size(this._dimensions.x, this._dimensions.y);
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
        if (!this.isRendered) {
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

        const radius = this._dimensions.scale(0.5);
        return {
            origin: this._center.add(radius.scale(-1)),
            center: this._center,
            dimensions: this._dimensions,
            topLeft: this._center.add(radius.scale(-1)),
            topRight: this._center.add(radius.signAs(Vector.southeast)),
            bottomLeft: this._center.add(radius.signAs(Vector.northwest)),
            bottomRight: this._center.add(radius),
            rotation: this._rotation
        };
    }

    public get transformedBox(): BoundingBox {
        if (!this.isRendered) {
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

    public setCenterAndDimensions(center: Vector, dimensions: Vector): void {
        this._center = center;
        this._dimensions = dimensions;

        this._svg && this._svg
            .rotate(0)
            .center(this._center.x, this._center.y)
            .size(this._dimensions.x, this._dimensions.y)
            .rotate(radToDeg(this._rotation));
    }

    public render(): void {
        // Silently fail if the SVG is already rendered
        if (this.isRendered) {
            return;
        }

        this._svg = this._slide.canvas.ellipse(this._dimensions.x, this._dimensions.y)
            .center(this._center.x, this._center.y)
            .fill(this._fillColor)
            .stroke({ color: this._strokeColor, width: this._strokeWidth })
            .rotate(radToDeg(this._rotation));
        decorateEllipseEvents(this._svg, this._slide, this);
    }

    public unrender(): void {
        this._svg && this._svg.remove();
        this._svg = undefined;
    }
}

export default EllipseRenderer;
