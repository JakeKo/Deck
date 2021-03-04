import { decorateRectangleEvents } from '@/events/decorators';
import SnapVector from '@/utilities/SnapVector';
import { radToDeg } from '@/utilities/utilities';
import V from '@/utilities/Vector';
import SVG from 'svg.js';
import { BoundingBox, GRAPHIC_TYPES, IRectangleRenderer, ISlideRenderer } from '../types';

class RectangleRenderer implements IRectangleRenderer {
    public readonly id: string;
    public readonly type = GRAPHIC_TYPES.RECTANGLE;
    private _slide: ISlideRenderer;
    private _svg: SVG.Rect | undefined;
    private _origin: V;
    private _dimensions: V;
    private _fillColor: string;
    private _strokeColor: string;
    private _strokeWidth: number;
    private _rotation: number;

    constructor(args: {
        id: string;
        slide: ISlideRenderer;
        origin?: V;
        dimensions?: V;
        fillColor?: string;
        strokeColor?: string;
        strokeWidth?: number;
        rotation?: number;
    }) {
        this.id = args.id;
        this._slide = args.slide;
        this._origin = args.origin || V.zero;
        this._dimensions = args.dimensions || V.zero;
        this._fillColor = args.fillColor || '#CCCCCC';
        this._strokeColor = args.strokeColor || 'none';
        this._strokeWidth = args.strokeWidth || 0;
        this._rotation = args.rotation || 0;
    }

    public get isRendered(): boolean {
        return this._svg !== undefined;
    }

    public get origin(): V {
        return this._origin;
    }

    public set origin(origin: V) {
        this._origin = origin;
        this._svg && this._svg.rotate(0).translate(this._origin.x, this._origin.y).rotate(radToDeg(this._rotation));
    }

    public get dimensions(): V {
        return this._dimensions;
    }

    public set dimensions(dimensions: V) {
        this._dimensions = dimensions;
        this._svg && this._svg.rotate(0).size(this._dimensions.x, this._dimensions.y).rotate(radToDeg(this._rotation));
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
        return this.isRendered
            ? {
                origin: this._origin,
                center: this._origin.add(this._dimensions.scale(0.5)),
                dimensions: this._dimensions,
                topLeft: this._origin,
                topRight: this._origin.addX(this._dimensions.x),
                bottomLeft: this._origin.addY(this._dimensions.y),
                bottomRight: this._origin.add(this._dimensions),
                rotation: this._rotation
            } : {
                origin: V.zero,
                center: V.zero,
                dimensions: V.zero,
                topLeft: V.zero,
                topRight: V.zero,
                bottomLeft: V.zero,
                bottomRight: V.zero,
                rotation: 0
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
            topLeft: staticBox.center.add(corners.topLeft.rotate(staticBox.rotation)),
            topRight: staticBox.center.add(corners.topRight.rotate(staticBox.rotation)),
            bottomLeft: staticBox.center.add(corners.bottomLeft.rotate(staticBox.rotation)),
            bottomRight: staticBox.center.add(corners.bottomRight.rotate(staticBox.rotation)),
            rotation: staticBox.rotation
        };
    }

    // Get the points by which a graphic can be pulled to snap to existing snap vectors
    // These points are based on the transformed shape (unlike snap vectors which distinquish static and transformed)
    public get pullPoints(): V[] {
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
            new SnapVector(box.center, V.north),
            new SnapVector(box.center, V.east)
        ];
    }

    public get transformedSnapVectors(): SnapVector[] {
        const box = this.transformedBox;
        const topCenter = box.topLeft.add(box.topLeft.towards(box.topRight).scale(0.5));
        const leftCenter = box.topRight.add(box.topRight.towards(box.bottomRight).scale(0.5));
        const bottomCenter = box.bottomRight.add(box.bottomRight.towards(box.bottomLeft).scale(0.5));
        const rightCenter = box.bottomLeft.add(box.bottomLeft.towards(box.topLeft).scale(0.5));

        return [
            new SnapVector(topCenter, V.east.rotate(box.rotation)),
            new SnapVector(leftCenter, V.north.rotate(box.rotation)),
            new SnapVector(bottomCenter, V.east.rotate(box.rotation)),
            new SnapVector(rightCenter, V.north.rotate(box.rotation)),
            new SnapVector(box.center, V.east.rotate(-box.rotation)),
            new SnapVector(box.center, V.north.rotate(-box.rotation))
        ];
    }

    public setOriginAndDimensions(origin: V, dimensions: V): void {
        this._origin = origin;
        this._dimensions = dimensions;

        this._svg && this._svg
            .rotate(0)
            .translate(this._origin.x, this._origin.y)
            .size(this._dimensions.x, this._dimensions.y)
            .rotate(radToDeg(this._rotation));
    }

    public render(): void {
        // Silently fail if the SVG is already rendered
        if (this.isRendered) {
            return;
        }

        this._svg = this._slide.canvas.rect(this._dimensions.x, this._dimensions.y)
            .translate(this._origin.x, this._origin.y)
            .fill(this._fillColor)
            .stroke({ color: this._strokeColor, width: this._strokeWidth })
            .rotate(radToDeg(this._rotation));
        decorateRectangleEvents(this._svg, this._slide, this);
    }

    public unrender(): void {
        this._svg && this._svg.remove();
        this._svg = undefined;
    }
}

export default RectangleRenderer;
