import V from '@/utilities/Vector';
import SVG from 'svg.js';
import { GRAPHIC_TYPES, ICanvasRenderer, ISlideRenderer } from '../types';

type CanvasRendererArgs = {
    slide: ISlideRenderer;
    origin: V;
    dimensions: V;
};

class CanvasRenderer implements ICanvasRenderer {
    public readonly type = GRAPHIC_TYPES.CANVAS;
    private _slide: ISlideRenderer;
    private _svg: SVG.Rect | undefined;
    private _origin: V;
    private _dimensions: V;
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

    public set scale(_: number) {
        // eslint-disable-next-line no-useless-return
        return;
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
