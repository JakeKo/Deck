import { decorateImageEvents } from '@/events/decorators';
import { radToDeg } from '@/utilities/utilities';
import Vector from '@/utilities/Vector';
import SVG from 'svg.js';
import { BoundingBox, GRAPHIC_TYPES, IImageRenderer, ISlideRenderer } from '../types';

class ImageRenderer implements IImageRenderer {
    public readonly id: string;
    public readonly type = GRAPHIC_TYPES.IMAGE;
    public readonly source: string;
    private _slide: ISlideRenderer;
    private _svg: SVG.Image | undefined;
    private _origin: Vector;
    private _dimensions: Vector;
    private _rotation: number;

    constructor(args: {
        id: string;
        slide: ISlideRenderer;
        source: string;
        origin?: Vector;
        dimensions?: Vector;
        rotation?: number;
    }) {
        this.id = args.id;
        this.source = args.source;
        this._slide = args.slide;
        this._origin = args.origin || Vector.zero;
        this._dimensions = args.dimensions || Vector.zero;
        this._rotation = args.rotation || 0;
    }

    public get isRendered(): boolean {
        return this._svg !== undefined;
    }

    public get origin(): Vector {
        return this._origin;
    }

    public set origin(origin: Vector) {
        this._origin = origin;
        this._svg && this._svg.rotate(0).translate(this._origin.x, this._origin.y).rotate(radToDeg(this._rotation));
    }

    public get dimensions(): Vector {
        return this._dimensions;
    }

    public set dimensions(dimensions: Vector) {
        this._dimensions = dimensions;
        this._svg && this._svg.size(this._dimensions.x, this._dimensions.y);
    }

    public get rotation(): number {
        return this._rotation;
    }

    public set rotation(rotation: number) {
        this._rotation = rotation;
        this._svg && this._svg.rotate(radToDeg(this._rotation));
    }

    public get staticBox(): BoundingBox {
        return this.isRendered ? {
            origin: this._origin,
            center: this._origin.add(this._dimensions.scale(0.5)),
            dimensions: this._dimensions,
            topLeft: this._origin,
            topRight: this._origin.add(new Vector(this._dimensions.x, 0)),
            bottomLeft: this._origin.add(new Vector(0, this._dimensions.y)),
            bottomRight: this._origin.add(this._dimensions),
            rotation: this._rotation
        } : {
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

    public setOriginAndDimensions(origin: Vector, dimensions: Vector): void {
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

        this._svg = this._slide.canvas.image(this.source, this._dimensions.x, this._dimensions.y)
            .translate(this._origin.x, this._origin.y)
            .rotate(radToDeg(this._rotation));
        decorateImageEvents(this._svg, this._slide, this);
    }

    public unrender(): void {
        this._svg && this._svg.remove();
        this._svg = undefined;
    }
}

export default ImageRenderer;
