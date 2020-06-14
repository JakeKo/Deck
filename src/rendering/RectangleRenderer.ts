import * as SVG from 'svg.js';
import Vector from '../models/Vector';
import { GRAPHIC_TYPES, GRAPHIC_ROLES } from './constants';
import AnchorRenderer from './AnchorRenderer';
import { GraphicRenderer, AnchorHandler } from './types';

type RectangleRendererArgs = {
    id: string;
    canvas: SVG.Doc;
    role?: string;
    origin?: Vector;
    width?: number;
    height?: number;
    fillColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
    rotation?: number;
};

type RectangleAnchors = {
    'top-left': {
        initializeHander: () => AnchorHandler,
        graphic: AnchorRenderer
    },
    'top-right': {
        initializeHander: () => AnchorHandler,
        graphic: AnchorRenderer
    },
    'bottom-right': {
        initializeHander: () => AnchorHandler,
        graphic: AnchorRenderer
    },
    'bottom-left': {
        initializeHander: () => AnchorHandler,
        graphic: AnchorRenderer
    },
};

const DEFAULT_ARGS = {
    role: GRAPHIC_ROLES.STANDARD,
    origin: Vector.zero,
    width: 0,
    height: 0,
    fillColor: '#FFFFFF',
    strokeColor: '#000000',
    strokeWidth: 1,
    rotation: 0
};

class RectangleRenderer implements GraphicRenderer {
    private _id: string;
    private _canvas: SVG.Doc;
    private _svg: SVG.Rect | undefined;
    private _type: string;
    private _role: string;
    private _origin: Vector;
    private _width: number;
    private _height: number;
    private _fillColor: string;
    private _strokeColor: string;
    private _strokeWidth: number;
    private _rotation: number;
    private _anchors: RectangleAnchors;

    constructor(args: RectangleRendererArgs) {
        this._id = args.id;
        this._canvas = args.canvas;
        this._type = GRAPHIC_TYPES.RECTANGLE;
        this._role = args.role || DEFAULT_ARGS.role;
        this._origin = args.origin || DEFAULT_ARGS.origin;
        this._width = args.width || DEFAULT_ARGS.width;
        this._height = args.height || DEFAULT_ARGS.height;
        this._fillColor = args.fillColor || DEFAULT_ARGS.fillColor;
        this._strokeColor = args.strokeColor || DEFAULT_ARGS.strokeColor;
        this._strokeWidth = args.strokeWidth || DEFAULT_ARGS.strokeWidth;
        this._rotation = args.rotation || DEFAULT_ARGS.rotation;

        // TODO: Decide if anchors should be absolutely or relatively positioned
        this._anchors = {
            'top-left': {
                initializeHander: this._topLeftAnchorHandler,
                graphic: new AnchorRenderer({
                    canvas: this._canvas,
                    center: this._origin
                })
            },
            'top-right': {
                initializeHander: this._topRightAnchorHandler,
                graphic: new AnchorRenderer({
                    canvas: this._canvas,
                    center: this._origin.add(new Vector(this._width, 0))
                })
            },
            'bottom-right': {
                initializeHander: this._bottomRightAnchorHandler,
                graphic: new AnchorRenderer({
                    canvas: this._canvas,
                    center: this._origin.add(new Vector(this._width, this._height))
                })
            },
            'bottom-left': {
                initializeHander: this._bottomLeftAnchorHandler,
                graphic: new AnchorRenderer({
                    canvas: this._canvas,
                    center: this._origin.add(new Vector(0, this._height))
                })
            }
        };
    }

    public get id(): string {
        return this._id;
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

    public set origin(origin: Vector) {
        // Update property
        this._origin = origin;

        // Update SVG if it exists
        this._svg !== undefined && this._svg.rotate(0);
        this._svg !== undefined && this._svg.translate(this._origin.x, this._origin.y);
        this._svg !== undefined && this._svg.rotate(this._rotation);

        // Update anchors
        this._anchors['top-left'].graphic.center = this._origin;
        this._anchors['top-right'].graphic.center = this._origin.add(new Vector(this._width, 0));
        this._anchors['bottom-right'].graphic.center = this._origin.add(new Vector(this._width, this._height));
        this._anchors['bottom-left'].graphic.center = this._origin.add(new Vector(0, this._height));
    }

    public set width(width: number) {
        // Update property
        this._width = width;

        // Update SVG if it exists
        this._svg !== undefined && this._svg.width(this._width);

        // Update anchors
        this._anchors['top-right'].graphic.center = this._origin.add(new Vector(this._width, 0));
        this._anchors['bottom-right'].graphic.center = this._origin.add(new Vector(this._width, this._height));
    }

    public set height(height: number) {
        // Update property
        this._height = height;

        // Update SVG if it exists
        this._svg !== undefined && this._svg.height(this._height);

        // Update anchors
        this._anchors['bottom-right'].graphic.center = this._origin.add(new Vector(this._width, this._height));
        this._anchors['bottom-left'].graphic.center = this._origin.add(new Vector(0, this._height));
    }

    public set fillColor(fillColor: string) {
        // Update property
        this._fillColor = fillColor;

        // Update SVG if it exists
        this._svg !== undefined && this._svg.fill(this._fillColor);
    }

    public set strokeColor(strokeColor: string) {
        // Update property
        this._strokeColor = strokeColor;

        // Update SVG if it exists
        this._svg !== undefined && this._svg.stroke({ color: this._strokeColor, width: this._strokeWidth });
    }

    public set strokeWidth(strokeWidth: number) {
        // Update property
        this._strokeWidth = strokeWidth;

        // Update SVG if it exists
        this._svg !== undefined && this._svg.stroke({ color: this._strokeColor, width: this._strokeWidth });
    }

    public set rotation(rotation: number) {
        // Update property
        this._rotation = rotation;

        // Update SVG if it exists
        this._svg !== undefined && this._svg.rotate(this._rotation);
    }

    public render(): void {
        this._svg = this._canvas.rect(this._width, this._height)
            .translate(this._origin.x, this._origin.y)
            .fill(this._fillColor)
            .stroke({ color: this._strokeColor, width: this._strokeWidth })
            .rotate(this._rotation);
    }

    public unrender(): void {
        // Silently fail if the SVG was not rendered in the first place
        this._svg !== undefined && this._svg.remove();
        this._svg = undefined;
    }

    public showFocus(): void {
        this._anchors['top-left'].graphic.render();
        this._anchors['top-right'].graphic.render();
        this._anchors['bottom-right'].graphic.render();
        this._anchors['bottom-left'].graphic.render();
    }

    public hideFocus(): void {
        this._anchors['top-left'].graphic.unrender();
        this._anchors['top-right'].graphic.unrender();
        this._anchors['bottom-right'].graphic.unrender();
        this._anchors['bottom-left'].graphic.unrender();
    }

    // TODO: Determine if this is the best place for anchor handlers
    private _topLeftAnchorHandler(): AnchorHandler {
        const opposingCorner = this._origin.add(new Vector(this._width, this._height));

        return position => {
            // If the position is beyond the corner opposite the original origin
            if (position.x > opposingCorner.x && position.y > opposingCorner.y) {
                this.origin = opposingCorner;
                this.width = position.x - opposingCorner.x;
                this.height = position.y - opposingCorner.y;
            }

            // If the position is beyond the width of the rectangle
            else if (position.x > opposingCorner.x) {
                this.origin = new Vector(opposingCorner.x, position.y);
                this.width = position.x - opposingCorner.x;
                this.height = opposingCorner.y - position.y;
            }

            // If the position is beyond the height of the rectangle
            else if (position.y > opposingCorner.y) {
                this.origin = new Vector(position.x, opposingCorner.y);
                this.width = opposingCorner.x - position.x;
                this.height = position.y - opposingCorner.y;
            }

            // If the position is within the original corner
            else {
                this.origin = position;
                this.width = opposingCorner.x - position.x;
                this.height = opposingCorner.y - position.y;
            }
        };
    }

    // TODO: Complete anchor handlers
    private _topRightAnchorHandler(): AnchorHandler {
        return () => { };
    }

    private _bottomRightAnchorHandler(): AnchorHandler {
        return () => { };
    }

    private _bottomLeftAnchorHandler(): AnchorHandler {
        return () => { };
    }
}

export default RectangleRenderer;
