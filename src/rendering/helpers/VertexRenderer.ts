import { decorateVertexEvents } from '@/events/decorators';
import Vector from '@/utilities/Vector';
import SVG from 'svg.js';
import { GRAPHIC_TYPES, IGraphicRenderer, ISlideRenderer, IVertexRenderer, VERTEX_ROLES } from '../types';

type VertexRendererArgs = {
    slide: ISlideRenderer;
    scale: number;
    role: VERTEX_ROLES;
    center: Vector;
    parent: IGraphicRenderer;
};

class VertexRenderer implements IVertexRenderer {
    public readonly type = GRAPHIC_TYPES.VERTEX;
    private _slide: ISlideRenderer;
    private _svg: SVG.Ellipse | undefined;
    private _role: VERTEX_ROLES;
    private _parent: IGraphicRenderer;
    private _scale: number;
    private _width: number;
    private _height: number;
    private _center: Vector;
    private _fillColor: string;
    private _strokeColor: string;
    private _strokeWidth: number;

    constructor(args: VertexRendererArgs) {
        this._slide = args.slide;
        this._role = args.role;
        this._parent = args.parent;
        this._scale = args.scale;
        this._center = args.center;
        this._width = 8;
        this._height = 8;
        this._fillColor = '#400c8b';
        this._strokeColor = 'none';
        this._strokeWidth = 0;
    }

    public get isRendered(): boolean {
        return this._svg !== undefined;
    }

    public get role(): VERTEX_ROLES {
        return this._role;
    }

    public get parent(): IGraphicRenderer {
        return this._parent;
    }

    public set center(center: Vector) {
        this._center = center;
        this._svg && this._svg.center(this._center.x, this._center.y);
    }

    public set scale(scale: number) {
        this._scale = scale;
        this._svg && this._svg.size(this._width * this._scale, this._height * this._scale);
    }

    public render(): void {
        // Silently fail if the SVG is already rendered
        if (this.isRendered) {
            return;
        }

        this._svg = this._slide.canvas.ellipse(this._width * this._scale, this._height * this._scale)
            .center(this._center.x, this._center.y)
            .fill(this._fillColor)
            .stroke({ color: this._strokeColor, width: this._strokeWidth });
        decorateVertexEvents(this._svg, this._slide, this);
    }

    public unrender(): void {
        this._svg && this._svg.remove();
        this._svg = undefined;
    }
}

export default VertexRenderer;
