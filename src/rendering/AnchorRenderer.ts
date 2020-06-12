import * as SVG from 'svg.js';
import Vector from '../models/Vector';
import { GRAPHIC_TYPES, GRAPHIC_ROLES } from './constants';
import { Renderer } from './types';

type AnchorRendererArgs = {
    parent: Renderer;
    center: Vector | undefined;
};

const DEFAULT_ARGS = {
    center: Vector.zero
};

class AnchorRenderer implements Renderer {
    private _svg: SVG.Ellipse | undefined;
    public _width: number;
    public _height: number;

    public type: string;
    public role: string;
    public parent: Renderer;
    public center: Vector;

    constructor(args: AnchorRendererArgs) {
        this.type = GRAPHIC_TYPES.ELLIPSE;
        this.role = GRAPHIC_ROLES.ANCHOR;
        this.parent = args.parent;
        this.center = args.center || DEFAULT_ARGS.center;
        this._width = 4;
        this._height = 4;
    }

    public setCenter(center: Vector): void {
        this.center = center;
        this._svg !== undefined && this._svg.translate(this.center.x - this._width / 2, this.center.y - this._height / 2);
    }

    public isRendered(): boolean {
        return this._svg !== undefined;
    }

    public render(canvas: SVG.Doc): void {
        this._svg = canvas.ellipse(this._width, this._height)
            .translate(this.center.x - this._width / 2, this.center.y - this._height / 2)
            .fill('#FFFFFF')
            .stroke({ color: '#888888', width: 1 });
    }

    public unrender(): void {
        // Silently fail if the SVG was not rendered in the first place
        this._svg !== undefined && this._svg.remove();
        this._svg = undefined;
    }
}

export default AnchorRenderer;
