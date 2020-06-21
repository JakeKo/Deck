import * as SVG from 'svg.js';
import Vector from '../../utilities/Vector';

type VertexRendererArgs = {
    canvas: SVG.Doc;
    center?: Vector;
};

const DEFAULT_ARGS = {
    center: Vector.zero
};

// TODO: Figure out how to make anchors zoom-insensitive
class VertexRenderer {
    private _canvas: SVG.Doc;
    private _svg: SVG.Ellipse | undefined;
    private _width: number;
    private _height: number;
    private _center: Vector;

    constructor(args: VertexRendererArgs) {
        this._canvas = args.canvas;
        this._center = args.center || DEFAULT_ARGS.center;
        this._width = 4;
        this._height = 4;
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
            .fill('#FFFFFF')
            .stroke({ color: '#888888', width: 1 });
    }

    public unrender(): void {
        this._svg && this._svg.remove();
        this._svg = undefined;
    }
}

export default VertexRenderer;
