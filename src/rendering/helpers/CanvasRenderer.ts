import * as SVG from 'svg.js';
import Vector from "../../utilities/Vector";
import SlideRenderer from '../SlideRenderer';
import { GRAPHIC_TYPES, HelperRenderer } from "../types";

type CanvasRendererArgs = {
    slide: SlideRenderer;
    origin: Vector;
    width: number;
    height: number;
};

class CanvasRenderer implements HelperRenderer {
    private _slide: SlideRenderer;
    private _svg: SVG.Rect | undefined;
    private _origin: Vector;
    private _width: number;
    private _height: number;
    private _fillColor: string;

    constructor(args: CanvasRendererArgs) {
        this._slide = args.slide;
        this._origin = args.origin;
        this._width = args.width;
        this._height = args.height;
        this._fillColor = '#FFFFFF';
    }

    public getType(): GRAPHIC_TYPES {
        return GRAPHIC_TYPES.CANVAS;
    }

    public isRendered(): boolean {
        return this._svg !== undefined;
    }

    public render(): void {
        // Silently fail if the SVG is already rendered
        if (this.isRendered()) {
            return;
        }

        this._svg = this._slide.canvas.rect(this._width, this._height)
            .translate(this._origin.x, this._origin.y)
            .fill(this._fillColor);
    }

    public unrender(): void {
        this._svg && this._svg.remove();
        this._svg = undefined;
    }
}

export default CanvasRenderer;
