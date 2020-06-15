import * as SVG from 'svg.js';
import Vector from '../../models/Vector';
import { GRAPHIC_TYPES, GRAPHIC_ROLES } from '../constants';

type AnchorRendererArgs = {
    canvas: SVG.Doc;
    center?: Vector;
};

const DEFAULT_ARGS = {
    center: Vector.zero
};

// TODO: Figure out how to make anchors zoom-insensitive
// TODO: Implement other anchor handlers for more niche functionality
class AnchorRenderer {
    private _canvas: SVG.Doc;
    private _svg: SVG.Ellipse | undefined;
    private _type: string;
    private _role: string;
    private _width: number;
    private _height: number;
    private _center: Vector;

    constructor(args: AnchorRendererArgs) {
        this._canvas = args.canvas;
        this._type = GRAPHIC_TYPES.ELLIPSE;
        this._role = GRAPHIC_ROLES.ANCHOR;
        this._center = args.center || DEFAULT_ARGS.center;
        this._width = 4;
        this._height = 4;
    }
    
    public get type(): string {
        return this._type;
    }
    
    public get role(): string {
        return this._role;
    }

    public get isRendered(): boolean {
        return this._svg !== undefined;
    }

    public set center(center: Vector) {
        this._center = center;
        this._svg?.translate(this._center.x - this._width / 2, this._center.y - this._height / 2);
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
        this._svg?.remove();
        this._svg = undefined;
    }
}

export default AnchorRenderer;
