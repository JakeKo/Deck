import { decorateTextboxEvents } from '../../events/decorators';
import Vector from '../../utilities/Vector';
import SlideRenderer from '../SlideRenderer';
import { BoundingBox, GraphicRenderer, GRAPHIC_TYPES } from '../types';

type TextboxRendererArgs = {
    id: string;
    slide: SlideRenderer;
    origin?: Vector;
    width?: number;
    height?: number;
    size?: number;
    text?: string;
    weight?: string;
    font?: string;
    rotation?: number;
};

class TextboxRenderer implements GraphicRenderer {
    private _id: string;
    private _slide: SlideRenderer;
    private _svg: SVGForeignObjectElement | undefined;
    private _textbox: HTMLDivElement | undefined;
    private _origin: Vector;
    private _width: number;
    private _height: number;
    private _text: string;
    private _size: number;
    private _weight: string;
    private _font: string;
    private _rotation: number;

    constructor(args: TextboxRendererArgs) {
        this._id = args.id;
        this._slide = args.slide;
        this._origin = args.origin || Vector.zero;
        this._width = args.width || 0;
        this._height = args.height || 0;
        this._text = args.text || 'Lorem ipsum';
        this._size = args.size || 24;
        this._weight = args.weight || '400';
        this._font = args.font || 'Arial';
        this._rotation = args.rotation || 0;
    }

    public getId(): string {
        return this._id;
    }

    public getType(): GRAPHIC_TYPES {
        return GRAPHIC_TYPES.TEXTBOX;
    }

    public isRendered(): boolean {
        return this._svg !== undefined;
    }

    public render(): void {
        // Silently fail if the SVG is already rendered
        if (this.isRendered()) {
            return;
        }

        this._svg = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
        this._svg.setAttribute('x', `${this._origin.x}px`);
        this._svg.setAttribute('y', `${this._origin.y}px`);
        this._svg.setAttribute('width', `${this._width}px`);
        this._svg.setAttribute('height', `${this._height}px`);
        this._svg.style.transform = `rotate(${this._rotation}deg)`;
        this._slide.canvas.node.appendChild(this._svg);

        this._textbox = document.createElement('div');
        this._textbox.innerHTML = this._text;
        this._textbox.style.width = '100%';
        this._textbox.style.height = '100%';
        this._textbox.style.font = `${this._size}px ${this._font}`;
        this._textbox.style.fontWeight = this._weight;
        this._textbox.style.overflow = 'hidden';
        this._svg.appendChild(this._textbox);

        decorateTextboxEvents(this._svg, this._slide, this);
    }

    public unrender(): void {
        this._svg && this._svg.remove();
        this._svg = undefined;
        this._textbox = undefined;
    }

    public getOrigin(): Vector {
        return this._origin;
    }

    public setOrigin(origin: Vector): void {
        this._origin = origin;
        this._svg && this._svg.setAttribute('x', `${this._origin.x}px`);
        this._svg && this._svg.setAttribute('y', `${this._origin.y}px`);
    }

    public getWidth(): number {
        return this._width;
    }

    public setWidth(width: number): void {
        this._width = width;
        this._svg && this._svg.setAttribute('width', `${this._width}px`);
    }

    public getHeight(): number {
        return this._height;
    }

    public setHeight(height: number): void {
        this._height = height;
        this._svg && this._svg.setAttribute('height', `${this._height}px`);
    }

    public getText(): string {
        return this._text;
    }

    public setText(text: string): void {
        this._text = text;
        if (this._textbox) {
            this._textbox.innerHTML = this._text;
        }
    }

    public getSize(): number {
        return this._size;
    }

    public setSize(size: number): void {
        this._size = size;
        if (this._textbox) {
            this._textbox.style.font = `${this._size}px ${this._font}`;
            this._textbox.style.fontWeight = this._weight;
        }
    }

    public getWeight(): string {
        return this._weight;
    }

    public setWeight(weight: string): void {
        this._weight = weight;
        if (this._textbox) {
            this._textbox.style.font = `${this._size}px ${this._font}`;
            this._textbox.style.fontWeight = this._weight;
        }
    }

    public getFont(): string {
        return this._font;
    }

    public setFont(font: string): void {
        this._font = font;
        if (this._textbox) {
            this._textbox.style.font = `${this._size}px ${this._font}`;
            this._textbox.style.fontWeight = this._weight;
        }
    }

    public getRotation(): number {
        return this._rotation;
    }

    public setRotation(rotation: number): void {
        this._rotation = rotation;
        if (this._svg) {
            this._svg.style.transform = `rotate(${this._rotation}deg)`;
        }
    }

    public getBoundingBox(): BoundingBox {
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
            return {
                origin: this._origin,
                center: this._origin.add(new Vector(this._width, this._height).scale(0.5)),
                dimensions: new Vector(this._width, this._height),
                topLeft: this._origin,
                topRight: this._origin.add(new Vector(this._width, 0)),
                bottomLeft: this._origin.add(new Vector(0, this._height)),
                bottomRight: this._origin.add(new Vector(this._width, this._height)),
                rotation: this._rotation
            };
        }
    }
}

export default TextboxRenderer;
