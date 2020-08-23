import SVG from 'svg.js';
import { decorateVertexEvents } from '@/events/decorators';
import Vector from '@/utilities/Vector';
import SlideRenderer from '../SlideRenderer';
import { GraphicRenderer, GRAPHIC_TYPES, HelperRenderer, VERTEX_ROLES } from '../types';

type VertexRendererArgs = {
    slide: SlideRenderer;
    scale: number;
    role: VERTEX_ROLES;
    center: Vector;
    parent: GraphicRenderer;
};

class VertexRenderer implements HelperRenderer {
    private _slide: SlideRenderer;
    private _svg: SVG.Ellipse | undefined;
    private _role: VERTEX_ROLES;
    private _parent: GraphicRenderer;
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

    public getType(): GRAPHIC_TYPES {
        return GRAPHIC_TYPES.VERTEX;
    }

    public isRendered(): boolean {
        return this._svg !== undefined;
    }

    public getRole(): VERTEX_ROLES {
        return this._role;
    }

    public getParent(): GraphicRenderer {
        return this._parent;
    }

    public render(): void {
        // Silently fail if the SVG is already rendered
        if (this.isRendered()) {
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

    public setCenter(center: Vector): void {
        this._center = center;
        this._svg && this._svg.center(this._center.x, this._center.y);
    }

    public setScale(scale: number): void {
        this._scale = scale;
        this._svg && this._svg.size(this._width * this._scale, this._height * this._scale);
    }
}

export default VertexRenderer;
