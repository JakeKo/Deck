import { decorateTextboxEvents } from '@/events/decorators';
import { radToDeg } from '@/utilities/utilities';
import Vector from '@/utilities/Vector';
import { BoundingBox, GRAPHIC_TYPES, ISlideRenderer, ITextboxRenderer } from '../types';

type TextboxRendererArgs = {
    id: string;
    slide: ISlideRenderer;
    origin?: Vector;
    dimensions?: Vector;
    fontSize?: number;
    text?: string;
    fontWeight?: string;
    typeface?: string;
    rotation?: number;
};

class TextboxRenderer implements ITextboxRenderer {
    public readonly id: string;
    public readonly type = GRAPHIC_TYPES.TEXTBOX;
    private _slide: ISlideRenderer;
    private _svg: SVGForeignObjectElement | undefined;
    private _textbox: HTMLDivElement | undefined;
    private _origin: Vector;
    private _dimensions: Vector;
    private _text: string;
    private _fontSize: number;
    private _fontWeight: string;
    private _typeface: string;
    private _rotation: number;

    constructor(args: TextboxRendererArgs) {
        this.id = args.id;
        this._slide = args.slide;
        this._origin = args.origin || Vector.zero;
        this._dimensions = args.dimensions || Vector.zero;
        this._text = args.text || 'Lorem ipsum';
        this._fontSize = args.fontSize || 24;
        this._fontWeight = args.fontWeight || '400';
        this._typeface = args.typeface || 'Arial';
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
        if (this._svg) {
            this._svg.setAttribute('x', `${this._origin.x}px`);
            this._svg.setAttribute('y', `${this._origin.y}px`);
            this._svg.style.transformOrigin = `${this._origin.x + this._dimensions.x / 2}px ${this._origin.y + this._dimensions.y / 2}px`;
        }
    }

    public get dimensions(): Vector {
        return this._dimensions;
    }

    public set dimensions(dimensions: Vector) {
        this._dimensions = dimensions;
        if (this._svg) {
            this._svg.style.width = `${this._dimensions.x}px`;
            this._svg.style.height = `${this._dimensions.y}px`;
        }
    }

    public get text(): string {
        return this._text;
    }

    public set text(text: string) {
        this._text = text;
        if (this._textbox) {
            this._textbox.innerHTML = this._text;
        }
    }

    public get fontSize(): number {
        return this._fontSize;
    }

    public set fontSize(size: number) {
        this._fontSize = size;
        if (this._textbox) {
            this._textbox.style.font = `${this._fontSize}px ${this._typeface}`;
            this._textbox.style.fontWeight = this._fontWeight;
        }
    }

    public get fontWeight(): string {
        return this._fontWeight;
    }

    public set fontWeight(weight: string) {
        this._fontWeight = weight;
        if (this._textbox) {
            this._textbox.style.font = `${this._fontSize}px ${this._typeface}`;
            this._textbox.style.fontWeight = this._fontWeight;
        }
    }

    public get typeface(): string {
        return this._typeface;
    }

    public set typeface(font: string) {
        this._typeface = font;
        if (this._textbox) {
            this._textbox.style.font = `${this._fontSize}px ${this._typeface}`;
            this._textbox.style.fontWeight = this._fontWeight;
        }
    }

    public get rotation(): number {
        return this._rotation;
    }

    public set rotation(rotation: number) {
        this._rotation = rotation;
        if (this._svg) {
            this._svg.style.transform = `rotate(${radToDeg(this._rotation)}deg)`;
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

        if (this._svg) {
            this._svg.setAttribute('x', `${this._origin.x}px`);
            this._svg.setAttribute('y', `${this._origin.y}px`);
            this._svg.style.transformOrigin = `${this._origin.x + this._dimensions.x / 2}px ${this._origin.y + this._dimensions.y / 2}px`;
            this._svg.style.width = `${this._dimensions.x}px`;
            this._svg.style.height = `${this._dimensions.y}px`;
        }
    }

    public render(): void {
        // Silently fail if the SVG is already rendered
        if (this.isRendered) {
            return;
        }

        this._svg = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
        this._svg.setAttribute('x', `${this._origin.x}px`);
        this._svg.setAttribute('y', `${this._origin.y}px`);
        this._svg.style.transformOrigin = `${this._origin.x + this._dimensions.x / 2}px ${this._origin.y + this._dimensions.y / 2}px`;
        this._svg.style.width = `${this._dimensions.x}px`;
        this._svg.style.height = `${this._dimensions.y}px`;
        this._svg.style.transform = `rotate(${radToDeg(this._rotation)}deg)`;
        this._slide.canvas.node.appendChild(this._svg);

        this._textbox = document.createElement('div');
        this._textbox.innerHTML = this._text;
        this._textbox.style.width = '100%';
        this._textbox.style.height = '100%';
        this._textbox.style.font = `${this._fontSize}px ${this._typeface}`;
        this._textbox.style.fontWeight = this._fontWeight;
        this._textbox.style.overflow = 'hidden';
        this._svg.appendChild(this._textbox);

        decorateTextboxEvents(this._svg, this._slide, this);
    }

    public unrender(): void {
        this._svg && this._svg.remove();
        this._svg = undefined;
        this._textbox = undefined;
    }
}

export default TextboxRenderer;
