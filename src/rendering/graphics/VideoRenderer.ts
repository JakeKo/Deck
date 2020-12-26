import { decorateVideoEvents } from '@/events/decorators';
import { provideId } from '@/utilities/IdProvider';
import { radToDeg } from '@/utilities/utilities';
import Vector from '@/utilities/Vector';
import SVG from 'svg.js';
import YouTubeIframeLoader from 'youtube-iframe';
import { BoundingBox, GRAPHIC_TYPES, ISlideRenderer, IVideoRenderer } from '../types';

type VideoRendererArgs = {
    id: string;
    slide: ISlideRenderer;
    source: string;
    origin?: Vector;
    dimensions?: Vector;
    strokeColor?: string;
    strokeWidth?: number;
    rotation?: number;
};

class VideoRenderer implements IVideoRenderer {
    public readonly id: string;
    public readonly type = GRAPHIC_TYPES.VIDEO;
    public readonly source: string;
    private _slide: ISlideRenderer;
    private _svg: { node: SVGForeignObjectElement } | undefined;
    private _origin: Vector;
    private _dimensions: Vector;
    private _strokeColor: string;
    private _strokeWidth: number;
    private _rotation: number;

    constructor(args: VideoRendererArgs) {
        this.id = args.id;
        this._slide = args.slide;
        this.source = args.source;
        this._origin = args.origin || Vector.zero;
        this._dimensions = args.dimensions || Vector.zero;
        this._strokeColor = args.strokeColor || 'none';
        this._strokeWidth = args.strokeWidth || 0;
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
        this._svg && this._svg.node.setAttribute('x', this._origin.x.toString());
        this._svg && this._svg.node.setAttribute('y', this._origin.y.toString());
    }

    public get dimensions(): Vector {
        return this._dimensions;
    }

    public set dimensions(dimensions: Vector) {
        this._dimensions = dimensions;
        this._svg && this._svg.node.setAttribute('width', this._dimensions.x.toString());
        this._svg && this._svg.node.setAttribute('height', this._dimensions.y.toString());
    }

    public get strokeColor(): string {
        return this._strokeColor;
    }

    public set strokeColor(strokeColor: string) {
        this._strokeColor = strokeColor;
        if (this._svg) {
            this._svg.node.style.stroke = this._strokeColor;
        }
    }

    public get strokeWidth(): number {
        return this._strokeWidth;
    }

    public set strokeWidth(strokeWidth: number) {
        this._strokeWidth = strokeWidth;
        if (this._svg) {
            this._svg.node.style.strokeWidth = `${this._strokeWidth.toString()}px`;
        }
    }

    public get rotation(): number {
        return this._rotation;
    }

    public set rotation(rotation: number) {
        this._rotation = rotation;
        if (this._svg) {
            this._svg.node.style.transform = `rotate(${radToDeg(this._rotation)}deg)`;
        }
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
            const preRotateBox: BoundingBox = {
                origin: this._origin,
                center: this._origin.add(this._dimensions.scale(0.5)),
                dimensions: this._dimensions,
                topLeft: this._origin,
                topRight: this._origin.add(new Vector(this._dimensions.x, 0)),
                bottomLeft: this._origin.add(new Vector(0, this._dimensions.y)),
                bottomRight: this._origin.add(this._dimensions),
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

    public setOriginAndDimensions(origin: Vector, dimensions: Vector): void {
        this._origin = origin;
        this._dimensions = dimensions;

        this._svg && this._svg.node.setAttribute('x', this._origin.x.toString());
        this._svg && this._svg.node.setAttribute('y', this._origin.y.toString());
        this._svg && this._svg.node.setAttribute('width', this._dimensions.x.toString());
        this._svg && this._svg.node.setAttribute('height', this._dimensions.y.toString());
    }

    public render(): void {
        // Silently fail if the SVG is already rendered
        if (this.isRendered) {
            return;
        }

        const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
        const div = document.createElement('div');
        const id = div.id = provideId();
        foreignObject.appendChild(div);

        this._dimensions = new Vector(480, 270);
        YouTubeIframeLoader.load(YT => new YT.Player(id, {
            width: this._dimensions.x.toString(),
            height: this._dimensions.y.toString(),
            videoId: 'tLqhRvBbtcg'
        }));

        foreignObject.setAttribute('x', this._origin.x.toString());
        foreignObject.setAttribute('y', this._origin.y.toString());
        foreignObject.setAttribute('width', this._dimensions.x.toString());
        foreignObject.setAttribute('height', this._dimensions.y.toString());
        foreignObject.style.stroke = this._strokeColor;
        foreignObject.style.strokeWidth = `${this._strokeWidth.toString()}px`;
        foreignObject.style.transform = `rotate(${radToDeg(this._rotation)}deg)`;
        this._svg = { node: foreignObject };

        this._slide.canvas.add(this._svg as any as SVG.Element);
        decorateVideoEvents(this._svg, this._slide, this);
    }

    public unrender(): void {
        if (this._svg) {
            this._slide.canvas.node.removeChild(this._svg.node);
            this._svg = undefined;
        }
    }
}

export default VideoRenderer;
