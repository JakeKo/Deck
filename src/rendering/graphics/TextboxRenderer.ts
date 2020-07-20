import * as SVG from 'svg.js';
import { decorateTextboxEvents } from '../../events/decorators';
import Vector from '../../utilities/Vector';
import SlideRenderer from '../SlideRenderer';
import { GraphicRenderer, GRAPHIC_TYPES } from '../types';

type TextboxRendererArgs = {
    id: string;
    slideRenderer: SlideRenderer;
    origin?: Vector;
    width?: number;
    height?: number;
    size?: number;
    text?: string;
    weight?: string;
    font?: string;
    fillColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
    rotation?: number;
};

class TextboxRenderer implements GraphicRenderer {
    private _id: string;
    private _slide: SlideRenderer;
    private _svg: SVG.Text | undefined;
    private _type: GRAPHIC_TYPES;
    private _origin: Vector;
    private _width: number;
    private _height: number;
    private _text: string;
    private _size: number;
    private _weight: string;
    private _font: string;
    private _fillColor: string;
    private _strokeColor: string;
    private _strokeWidth: number;
    private _rotation: number;

    constructor(args: TextboxRendererArgs) {
        this._id = args.id;
        this._slide = args.slideRenderer;
        this._type = GRAPHIC_TYPES.RECTANGLE;
        this._origin = args.origin || Vector.zero;
        this._width = args.width || 0;
        this._height = args.height || 0;
        this._text = args.text || 'Lorem ipsum';
        this._size = args.size || 16;
        this._weight = args.weight || '400';
        this._font = args.font || 'Arial';
        this._fillColor = args.fillColor || '#CCCCCC';
        this._strokeColor = args.strokeColor || 'none';
        this._strokeWidth = args.strokeWidth || 0;
        this._rotation = args.rotation || 0;
    }

    public getId(): string {
        return this._id;
    }

    public getType(): GRAPHIC_TYPES {
        return this._type;
    }

    public isRendered(): boolean {
        return this._svg !== undefined;
    }

    public render(): void {
        // Silently fail if the SVG is already rendered
        if (this.isRendered()) {
            return;
        }

        this._svg = this._slide.canvas.text(this._text)
            .height(this._height)
            .width(this._width)
            .font({ weight: this._weight, family: this._font, size: this._size })
            .translate(this._origin.x, this._origin.y)
            .fill(this._fillColor)
            .stroke({ color: this._strokeColor, width: this._strokeWidth })
            .rotate(this._rotation);
        decorateTextboxEvents(this._svg, this._slide, this);
    }

    public unrender(): void {
        this._svg && this._svg.remove();
        this._svg = undefined;
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

    public getText(): string {
        return this._text;
    }

    public setText(text: string): void {
        this._text = text;
        this._svg && this._svg.text(this._text);
    }

    public getSize(): number {
        return this._size;
    }

    public setSize(size: number): void {
        this._size = size;
        this._svg && this._svg.font({ weight: this._weight, family: this._font, size: this._size });
    }

    public getWeight(): string {
        return this._weight;
    }

    public setWeight(weight: string): void {
        this._weight = weight;
        this._svg && this._svg.font({ weight: this._weight, family: this._font, size: this._size });
    }

    public getFont(): string {
        return this._font;
    }

    public setFont(font: string): void {
        this._font = font;
        this._svg && this._svg.font({ weight: this._weight, family: this._font, size: this._size });
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
}

export default TextboxRenderer;
