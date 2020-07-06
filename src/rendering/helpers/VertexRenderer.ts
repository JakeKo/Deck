import * as SVG from 'svg.js';
import { provideId } from '../../utilities/IdProvider';
import Vector from '../../utilities/Vector';
import { GraphicRenderer, GRAPHIC_TYPES } from '../types';
import { decorateVertexEvents } from '../utilities';

type VertexRendererArgs = {
    canvas: SVG.Doc;
    center?: Vector;
};

// TODO: Figure out how to make anchors zoom-insensitive
class VertexRenderer implements GraphicRenderer {
    private _id: string;
    private _type: GRAPHIC_TYPES;
    private _canvas: SVG.Doc;
    private _svg: SVG.Ellipse | undefined;
    private _width: number;
    private _height: number;
    private _center: Vector;
    private _fillColor: string;
    private _strokeColor: string;
    private _strokeWidth: number;

    constructor(args: VertexRendererArgs) {
        this._id = provideId();
        this._type = GRAPHIC_TYPES.VERTEX;
        this._canvas = args.canvas;
        this._center = args.center || Vector.zero;
        this._width = 8;
        this._height = 8;
        this._fillColor = '#888888';
        this._strokeColor = 'none';
        this._strokeWidth = 0;
    }

    public get id(): string {
        return this._id;
    }

    public get type(): GRAPHIC_TYPES {
        return this._type;
    }

    public get isRendered(): boolean {
        return this._svg !== undefined;
    }

    public set center(center: Vector) {
        this._center = center;
        this._svg && this._svg.translate(this._center.x - this._width / 2, this._center.y - this._height / 2);
    }

    public render(): void {
        // Silently fail if the SVG is already rendered
        if (this.isRendered) {
            return;
        }

        this._svg = this._canvas.ellipse(this._width, this._height)
            .translate(this._center.x - this._width / 2, this._center.y - this._height / 2)
            .fill(this._fillColor)
            .stroke({ color: this._strokeColor, width: this._strokeWidth });
    }

    public unrender(): void {
        this._svg && this._svg.remove();
        this._svg = undefined;
    }
}

export default VertexRenderer;
