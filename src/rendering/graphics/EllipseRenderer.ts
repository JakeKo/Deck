import { decorateEllipseEvents } from '@/events/decorators';
import { radToDeg } from '@/utilities/utilities';
import Vector from '@/utilities/Vector';
import SVG from 'svg.js';
import { BoundingBox, GRAPHIC_TYPES, IEllipseRenderer, ISlideRenderer } from '../types';

type EllipseRendererArgs = {
    id: string;
    slide: ISlideRenderer;
    center?: Vector;
    dimensions?: Vector;
    fillColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
    rotation?: number;
};

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

    constructor(args: EllipseRendererArgs) {
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
        this._svg && this._svg.rotate(0).translate(this._center.x, this._center.y).rotate(radToDeg(this._rotation));
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

    public get box(): BoundingBox {
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
        } else {
            const radius = this._dimensions.scale(0.5);
            const preRotateBox: BoundingBox = {
                origin: this._center.add(radius.scale(-1)),
                center: this._center,
                dimensions: this._dimensions,
                topLeft: this._center.add(radius.scale(-1)),
                topRight: this._center.add(radius.signAs(Vector.southeast)),
                bottomLeft: this._center.add(radius.signAs(Vector.northwest)),
                bottomRight: this._center.add(radius),
                rotation: this._rotation
            };

            const corners = {
                topLeft: preRotateBox.center.towards(preRotateBox.topLeft),
                topRight: preRotateBox.center.towards(preRotateBox.topRight),
                bottomLeft: preRotateBox.center.towards(preRotateBox.bottomLeft),
                bottomRight: preRotateBox.center.towards(preRotateBox.bottomRight)
            };

            return {
                origin: preRotateBox.origin,
                center: preRotateBox.center,
                dimensions: preRotateBox.dimensions,
                topLeft: preRotateBox.center.add(corners.topLeft.rotate(corners.topLeft.theta(Vector.east) + preRotateBox.rotation)),
                topRight: preRotateBox.center.add(corners.topRight.rotate(corners.topRight.theta(Vector.east) + preRotateBox.rotation)),
                bottomLeft: preRotateBox.center.add(corners.bottomLeft.rotate(corners.bottomLeft.theta(Vector.east) + preRotateBox.rotation)),
                bottomRight: preRotateBox.center.add(corners.bottomRight.rotate(corners.bottomRight.theta(Vector.east) + preRotateBox.rotation)),
                rotation: preRotateBox.rotation
            };
        }
    }

    public setCenterAndDimensions(center: Vector, dimensions: Vector): void {
        this._center = center;
        this._dimensions = dimensions;

        this._svg && this._svg
            .rotate(0)
            .translate(this._center.x, this._center.y)
            .size(this._dimensions.x, this._dimensions.y)
            .rotate(radToDeg(this._rotation));
    }

    public render(): void {
        // Silently fail if the SVG is already rendered
        if (this.isRendered) {
            return;
        }

        this._svg = this._slide.canvas.ellipse(this._dimensions.x, this._dimensions.y)
            .translate(this._center.x, this._center.y)
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
