import Vector from '@/utilities/Vector';
import SVG from 'svg.js';
import SlideRenderer from '../SlideRenderer';
import { GRAPHIC_TYPES, ICanvasRenderer } from '../types';

type CanvasRendererArgs = {
    slide: SlideRenderer;
    origin: Vector;
    dimensions: Vector;
};

class CanvasRenderer implements ICanvasRenderer {
    public readonly type = GRAPHIC_TYPES.CANVAS;
    private _slide: SlideRenderer;
    private _svg: SVG.Rect | undefined;
    private _origin: Vector;
    private _dimensions: Vector;
    private _fillColor: string;

    constructor(args: CanvasRendererArgs) {
        this._slide = args.slide;
        this._origin = args.origin;
        this._dimensions = args.dimensions;
        this._fillColor = '#FFFFFF';
    }

    public get isRendered(): boolean {
        return this._svg !== undefined;
    }

    public render(): void {
        // Silently fail if the SVG is already rendered
        if (this.isRendered) {
            return;
        }

        this._svg = this._slide.canvas.rect(this._dimensions.x, this._dimensions.y)
            .translate(this._origin.x, this._origin.y)
            .fill(this._fillColor);
    }

    public unrender(): void {
        this._svg && this._svg.remove();
        this._svg = undefined;
    }
}

export default CanvasRenderer;
