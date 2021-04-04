import { decorateVideoEvents } from '@/events/decorators';
import { VideoMutableSerialized } from '@/types';
import { provideId } from '@/utilities/IdProvider';
import SnapVector from '@/utilities/SnapVector';
import { radToDeg } from '@/utilities/utilities';
import V from '@/utilities/Vector';
import SVG from 'svg.js';
import YouTubeIframeLoader from 'youtube-iframe';
import { BoundingBox, GRAPHIC_TYPES, ISlideRenderer, IVideoRenderer } from '../types';

class VideoRenderer implements IVideoRenderer {
    public readonly id: string;
    public readonly type = GRAPHIC_TYPES.VIDEO;
    public readonly source: string;
    private _iframeId: string | undefined;
    private _slide: ISlideRenderer;
    private _svg: { node: SVGForeignObjectElement } | undefined;
    private _origin: V;
    private _dimensions: V;
    private _strokeColor: string;
    private _strokeWidth: number;
    private _rotation: number;

    constructor(args: {
        id: string;
        slide: ISlideRenderer;
        source: string;
        origin?: V;
        dimensions?: V;
        strokeColor?: string;
        strokeWidth?: number;
        rotation?: number;
    }) {
        this.id = args.id;
        this._slide = args.slide;
        this.source = args.source;
        this._origin = args.origin || V.zero;
        this._dimensions = args.dimensions || V.zero;
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
        this._svg && this._svg.node.setAttribute('x', this._origin.x.toString());
        this._svg && this._svg.node.setAttribute('y', this._origin.y.toString());
    }

    public get dimensions(): V {
        return this._dimensions;
    }

    public set dimensions(dimensions: V) {
        this._dimensions = dimensions;
        this._svg && this._svg.node.setAttribute('width', this._dimensions.x.toString());
        this._svg && this._svg.node.setAttribute('height', this._dimensions.y.toString());

        const iframe = document.getElementById(this._iframeId || '');
        if (this._svg && iframe) {
            iframe.setAttribute('width', this._dimensions.x.toString());
            iframe.setAttribute('height', this._dimensions.y.toString());
        }
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

    public get staticBox(): BoundingBox {
        return this.isRendered ? {
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
        return [box.topLeft, box.topRight, box.bottomRight, box.bottomLeft, box.center];
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

        this._svg && this._svg.node.setAttribute('x', this._origin.x.toString());
        this._svg && this._svg.node.setAttribute('y', this._origin.y.toString());
        this._svg && this._svg.node.setAttribute('width', this._dimensions.x.toString());
        this._svg && this._svg.node.setAttribute('height', this._dimensions.y.toString());
    }

    /**
     * Updates the graphic with the new provided properties and updates the rendering if necessary.
     */
    public setProps({ origin, dimensions, strokeWidth, strokeColor, rotation }: VideoMutableSerialized): void {
        if (origin !== undefined) {
            if (origin.x) {
                this._origin.x = origin.x;
            }

            if (origin.y) {
                this._origin.y = origin.y;
            }

            this._svg && this._svg.node.setAttribute('x', this._origin.x.toString());
            this._svg && this._svg.node.setAttribute('y', this._origin.y.toString());
        }

        if (dimensions !== undefined) {
            if (dimensions.x) {
                this._dimensions.x = dimensions.x;
            }

            if (dimensions.y) {
                this._dimensions.y = dimensions.y;
            }

            this._svg && this._svg.node.setAttribute('width', this._dimensions.x.toString());
            this._svg && this._svg.node.setAttribute('height', this._dimensions.y.toString());

            const iframe = document.getElementById(this._iframeId || '');
            if (this._svg && iframe) {
                iframe.setAttribute('width', this._dimensions.x.toString());
                iframe.setAttribute('height', this._dimensions.y.toString());
            }
        }

        if (strokeWidth !== undefined) {
            this._strokeWidth = strokeWidth;
            if (this._svg) {
                this._svg.node.style.strokeWidth = `${this._strokeWidth.toString()}px`;
            }
        }

        if (strokeColor !== undefined) {
            this._strokeColor = strokeColor;
            if (this._svg) {
                this._svg.node.style.stroke = this._strokeColor;
            }
        }

        if (rotation !== undefined) {
            this._rotation = rotation;
            if (this._svg) {
                this._svg.node.style.transform = `rotate(${radToDeg(this._rotation)}deg)`;
            }
        }
    }

    public render(): void {
        // Silently fail if the SVG is already rendered
        if (this.isRendered) {
            return;
        }

        const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
        const div = document.createElement('div');
        this._iframeId = div.id = provideId();
        foreignObject.appendChild(div);

        this._dimensions = new V(480, 270);
        YouTubeIframeLoader.load(YT => new YT.Player(this._iframeId, {
            width: this._dimensions.x.toString(),
            height: this._dimensions.y.toString(),
            videoId: this.source.split('v=')[1]
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
            this._iframeId = undefined;
        }
    }
}

export default VideoRenderer;
