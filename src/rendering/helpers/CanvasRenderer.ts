import * as SVG from 'svg.js';
import { provideId } from "../../utilities/IdProvider";
import Vector from "../../utilities/Vector";
import { GraphicRenderer, GRAPHIC_TYPES } from "../types";

type CanvasRendererArgs = {
    canvas: SVG.Doc;
    origin: Vector;
    width: number;
    height: number;
};

class CanvasRenderer implements GraphicRenderer {
    private _id: string;
    private _type: GRAPHIC_TYPES;
    private _canvas: SVG.Doc;
    private _svg: SVG.Rect | undefined;
    private _origin: Vector;
    private _width: number;
    private _height: number;
    private _fillColor: string;

    constructor(args: CanvasRendererArgs) {
        this._id = provideId();
        this._type = GRAPHIC_TYPES.CANVAS;
        this._canvas = args.canvas;
        this._origin = args.origin;
        this._width = args.width;
        this._height = args.height;
        this._fillColor = '#FFFFFF';
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

        this._svg = this._canvas.rect(this._width, this._height)
            .translate(this._origin.x, this._origin.y)
            .fill(this._fillColor);
    }

    public unrender(): void {
        this._svg && this._svg.remove();
        this._svg = undefined;
    }
}

export default CanvasRenderer;
