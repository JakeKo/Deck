import * as SVG from 'svg.js';
import { GraphicRenderer } from './types';
import RectangleRenderer from './graphics/RectangleRenderer';

type SlideRendererArgs = {
    canvas: SVG.Doc;
}

class SlideRenderer {
    private _canvas: SVG.Doc;
    private _graphics: { [index: string]: GraphicRenderer };

    constructor(args: SlideRendererArgs) {
        this._canvas = args.canvas;
        this._graphics = {};
    }

    public get canvas(): SVG.Doc {
        return this._canvas;
    }

    public set canvas(canvas: SVG.Doc) {
        this._canvas = canvas;
    }

    // TODO: Implement ID provider
    // TODO: Implement error handling for if canvas is not defined (better define if graphics should render on creation)
    public createRectangle(): string {
        const id = Math.random().toString();
        this._graphics[id] = new RectangleRenderer({ id, canvas: this._canvas! });
        this._canvas !== undefined && this._graphics[id].render(this._canvas);

        return id;
    }

    public focusGraphic(id: string): void {
        this._graphics[id].showFocus();
    }

    public unfocusGraphic(id: string): void {
        this._graphics[id].hideFocus();
    }
}

export default SlideRenderer;
