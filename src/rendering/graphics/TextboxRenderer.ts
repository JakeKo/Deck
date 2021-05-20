import { decorateTextboxEvents } from '@/events/decorators';
import { TextboxMutableSerialized } from '@/types';
import SnapVector from '@/utilities/SnapVector';
import { radToDeg } from '@/utilities/utilities';
import V from '@/utilities/Vector';
import { BoundingBox, GRAPHIC_TYPES, ISlideRenderer, ITextboxRenderer } from '../types';

class TextboxRenderer implements ITextboxRenderer {
    public readonly id: string;
    public readonly type = GRAPHIC_TYPES.TEXTBOX;
    private _slide: ISlideRenderer;
    private _svg: SVGForeignObjectElement | undefined;
    private _textbox: HTMLDivElement | undefined;
    private _origin: V;
    private _dimensions: V;
    private _text: string;
    private _fontSize: number;
    private _fontWeight: string;
    private _typeface: string;
    private _rotation: number;

    constructor(args: {
        id: string;
        slide: ISlideRenderer;
        origin?: V;
        dimensions?: V;
        fontSize?: number;
        text?: string;
        fontWeight?: string;
        typeface?: string;
        rotation?: number;
    }) {
        this.id = args.id;
        this._slide = args.slide;
        this._origin = args.origin || V.zero;
        this._dimensions = args.dimensions || V.zero;
        this._text = args.text || 'Lorem ipsum';
        this._fontSize = args.fontSize || 24;
        this._fontWeight = args.fontWeight || '400';
        this._typeface = args.typeface || 'Arial';
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
        if (this._svg) {
            this._svg.setAttribute('x', `${this._origin.x}px`);
            this._svg.setAttribute('y', `${this._origin.y}px`);
            this._svg.style.transformOrigin = `${this._origin.x + this._dimensions.x / 2}px ${this._origin.y + this._dimensions.y / 2}px`;
        }
    }

    public get dimensions(): V {
        return this._dimensions;
    }

    public set dimensions(dimensions: V) {
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
        const topLeft = box.topLeft;
        const topCenter = box.topLeft.add(box.topLeft.towards(box.topRight).scale(0.5));
        const topRight = box.topRight;
        const rightCenter = box.topRight.add(box.topRight.towards(box.bottomRight).scale(0.5));
        const bottomRight = box.bottomRight;
        const bottomCenter = box.bottomRight.add(box.bottomRight.towards(box.bottomLeft).scale(0.5));
        const bottomLeft = box.bottomLeft;
        const leftCenter = box.bottomLeft.add(box.bottomLeft.towards(box.topLeft).scale(0.5));

        return [V.north, V.east]
            .map(direction => direction.rotate(box.rotation))
            .flatMap(direction => [
                new SnapVector(topLeft, direction),
                new SnapVector(topCenter, direction),
                new SnapVector(topRight, direction),
                new SnapVector(rightCenter, direction),
                new SnapVector(bottomRight, direction),
                new SnapVector(bottomCenter, direction),
                new SnapVector(bottomLeft, direction),
                new SnapVector(leftCenter, direction)
            ]);
    }

    public setOriginAndDimensions(origin: V, dimensions: V): void {
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

    /**
     * Updates the graphic with the new provided properties and updates the rendering if necessary.
     */
    public setProps({ origin, dimensions, text, size, weight, font, rotation }: TextboxMutableSerialized): void {
        if (origin !== undefined) {
            if (origin.x) {
                this._origin.x = origin.x;
            }

            if (origin.y) {
                this._origin.y = origin.y;
            }

            if (this._svg) {
                this._svg.setAttribute('x', `${this._origin.x}px`);
                this._svg.setAttribute('y', `${this._origin.y}px`);
                this._svg.style.transformOrigin = `${this._origin.x + this._dimensions.x / 2}px ${this._origin.y + this._dimensions.y / 2}px`;
            }
        }

        if (dimensions !== undefined) {
            if (dimensions.x) {
                this._dimensions.x = dimensions.x;
            }

            if (dimensions.y) {
                this._dimensions.y = dimensions.y;
            }

            if (this._svg) {
                this._svg.style.width = `${this._dimensions.x}px`;
                this._svg.style.height = `${this._dimensions.y}px`;
            }
        }

        if (text !== undefined) {
            this._text = text;
            if (this._textbox) {
                this._textbox.innerHTML = this._text;
            }
        }

        if (size !== undefined || weight !== undefined || font !== undefined) {
            this._fontSize = size === undefined ? this._fontSize : size;
            this._fontWeight = weight === undefined ? this._fontWeight : weight;
            this._typeface = font === undefined ? this._typeface : font;
            if (this._textbox) {
                this._textbox.style.font = `${this._fontSize}px ${this._typeface}`;
                this._textbox.style.fontWeight = this._fontWeight;
            }
        }

        if (rotation !== undefined) {
            this._rotation = rotation;
            if (this._svg) {
                this._svg.style.transform = `rotate(${radToDeg(this._rotation)}deg)`;
            }
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
        this._textbox.style.overflowWrap = 'break-word';
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
