import * as SVG from 'svg.js';
import Vector from '../models/Vector';
import { GRAPHIC_TYPES, GRAPHIC_ROLES } from './constants';
import AnchorRenderer from './AnchorRenderer';

type RectangleRendererArgs = {
    role: string | undefined;
    origin: Vector | undefined;
    width: number | undefined;
    height: number | undefined;
    fillColor: string | undefined;
    strokeColor: string | undefined;
    strokeWidth: number | undefined;
    rotation: number | undefined;
};

type RectangleAnchors = {
    topLeft: AnchorRenderer,
    topRight: AnchorRenderer,
    bottomRight: AnchorRenderer,
    bottomLeft: AnchorRenderer
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

class RectangleRenderer {
    // TODO: Determine if SVG canvas should be passed in
    private _svg: SVG.Rect | undefined;

    public type: string;
    public role: string;
    public origin: Vector;
    public width: number;
    public height: number;
    public fillColor: string;
    public strokeColor: string;
    public strokeWidth: number;
    public rotation: number;
    public anchors: RectangleAnchors;

    constructor(args: RectangleRendererArgs) {
        this.type = GRAPHIC_TYPES.RECTANGLE;
        this.role = args.role || DEFAULT_ARGS.role;
        this.origin = args.origin || DEFAULT_ARGS.origin;
        this.width = args.width || DEFAULT_ARGS.width;
        this.height = args.height || DEFAULT_ARGS.height;
        this.fillColor = args.fillColor || DEFAULT_ARGS.fillColor;
        this.strokeColor = args.strokeColor || DEFAULT_ARGS.strokeColor;
        this.strokeWidth = args.strokeWidth || DEFAULT_ARGS.strokeWidth;
        this.rotation = args.rotation || DEFAULT_ARGS.rotation;

        // TODO: Decide if anchors should be absolutely or relatively positioned
        this.anchors = {
            topLeft: new AnchorRenderer({
                parent: this,
                center: this.origin
            }),
            topRight: new AnchorRenderer({
                parent: this,
                center: this.origin.add(new Vector(this.width, 0))
            }),
            bottomRight: new AnchorRenderer({
                parent: this,
                center: this.origin.add(new Vector(this.width, this.height))
            }),
            bottomLeft: new AnchorRenderer({
                parent: this,
                center: this.origin.add(new Vector(0, this.height))
            })
        };
    }

    public setOrigin(origin: Vector): void {
        // Update property
        this.origin = origin;

        // Update SVG if it exists
        this._svg !== undefined && this._svg.rotate(0);
        this._svg !== undefined && this._svg.translate(this.origin.x, this.origin.y);
        this._svg !== undefined && this._svg.rotate(this.rotation);

        // Update anchors
        this.anchors.topLeft.setCenter(this.origin);
        this.anchors.topRight.setCenter(this.origin.add(new Vector(this.width, 0)));
        this.anchors.bottomRight.setCenter(this.origin.add(new Vector(this.width, this.height)));
        this.anchors.bottomLeft.setCenter(this.origin.add(new Vector(0, this.height)));
    }

    public setWidth(width: number): void {
        // Update property
        this.width = width;

        // Update SVG if it exists
        this._svg !== undefined && this._svg.width(this.width);

        // Update anchors
        this.anchors.topRight.setCenter(this.origin.add(new Vector(this.width, 0)));
        this.anchors.bottomRight.setCenter(this.origin.add(new Vector(this.width, this.height)));
    }

    public setHeight(height: number): void {
        // Update property
        this.height = height;

        // Update SVG if it exists
        this._svg !== undefined && this._svg.height(this.height);

        // Update anchors
        this.anchors.bottomRight.setCenter(this.origin.add(new Vector(this.width, this.height)));
        this.anchors.bottomLeft.setCenter(this.origin.add(new Vector(0, this.height)));
    }

    public setFillColor(fillColor: string): void {
        // Update property
        this.fillColor = fillColor;

        // Update SVG if it exists
        this._svg !== undefined && this._svg.fill(this.fillColor);
    }

    public setStrokeColor(strokeColor: string): void {
        // Update property
        this.strokeColor = strokeColor;

        // Update SVG if it exists
        this._svg !== undefined && this._svg.stroke({ color: this.strokeColor, width: this.strokeWidth });
    }

    public setStrokeWidth(strokeWidth: number): void {
        // Update property
        this.strokeWidth = strokeWidth;

        // Update SVG if it exists
        this._svg !== undefined && this._svg.stroke({ color: this.strokeColor, width: this.strokeWidth });
    }

    public setRotation(rotation: number): void {
        // Update property
        this.rotation = rotation;

        // Update SVG if it exists
        this._svg !== undefined && this._svg.rotate(this.rotation);
    }

    public isRendered(): boolean {
        return this._svg !== undefined;
    }

    public render(canvas: SVG.Doc): void {
        this._svg = canvas.rect(this.width, this.height)
            .translate(this.origin.x, this.origin.y)
            .fill(this.fillColor)
            .stroke({ color: this.strokeColor, width: this.strokeWidth })
            .rotate(this.rotation);
    }

    public unrender(): void {
        // Silently fail if the SVG was not rendered in the first place
        this._svg !== undefined && this._svg.remove();
        this._svg = undefined;
    }
}

export default RectangleRenderer;
