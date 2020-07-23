import * as SVG from 'svg.js';
import { decorateVideoEvents } from '../../events/decorators';
import Vector from '../../utilities/Vector';
import SlideRenderer from '../SlideRenderer';
import { GraphicRenderer, GRAPHIC_TYPES } from '../types';

type VideoRendererArgs = {
    id: string;
    slide: SlideRenderer;
    source: HTMLVideoElement;
    origin?: Vector;
    width?: number;
    height?: number;
    strokeColor?: string;
    strokeWidth?: number;
    rotation?: number;
};

class VideoRenderer implements GraphicRenderer {
    private _id: string;
    private _slide: SlideRenderer;
    private _svg: SVG.Element | undefined;
    private _source: HTMLVideoElement;
    private _origin: Vector;
    private _width: number;
    private _height: number;
    private _strokeColor: string;
    private _strokeWidth: number;
    private _rotation: number;

    constructor(args: VideoRendererArgs) {
        this._id = args.id;
        this._slide = args.slide;
        this._source = args.source;
        this._origin = args.origin || Vector.zero;
        this._width = args.width || 0;
        this._height = args.height || 0;
        this._strokeColor = args.strokeColor || 'none';
        this._strokeWidth = args.strokeWidth || 0;
        this._rotation = args.rotation || 0;
    }

    public getId(): string {
        return this._id;
    }

    public getType(): GRAPHIC_TYPES {
        return GRAPHIC_TYPES.VIDEO;
    }

    public isRendered(): boolean {
        return this._svg !== undefined;
    }

    public render(): void {
        // Silently fail if the SVG is already rendered
        if (this.isRendered()) {
            return;
        }

        const foreignObject = SVG.create('foreignObject') as HTMLElement;
        foreignObject.appendChild(this._source);

        this._svg = (foreignObject as any as SVG.Element)
            .translate(this._origin.x, this._origin.y)
            .width(this._width)
            .height(this._height)
            .stroke({ color: this._strokeColor, width: this._strokeWidth })
            .rotate(this._rotation);

        this._slide.canvas.add(this._svg);
        decorateVideoEvents(this._svg, this._slide, this);
    }

    public unrender(): void {
        this._svg && this._svg.remove();
        this._svg = undefined;
    }

    public getSource(): HTMLVideoElement {
        return this._source;
    }

    public getOrigin(): Vector {
        return this._origin;
    }

    public setOrigin(origin: Vector): void {
        this._origin = origin;
        this._svg && this._svg.rotate(0).translate(this._origin.x, this._origin.y).rotate(this._rotation);
    }

    public getWidth(): number {
        return this._width;
    }

    public setWidth(width: number): void {
        this._width = width;
        this._svg && this._svg.width(this._width);
    }

    public getHeight(): number {
        return this._height;
    }

    public setHeight(height: number): void {
        this._height = height;
        this._svg && this._svg.height(this._height);
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
}

export default VideoRenderer;