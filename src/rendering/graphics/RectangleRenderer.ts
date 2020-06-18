import * as SVG from 'svg.js';
import Vector from '../../models/Vector';
import { GraphicRenderer, GRAPHIC_TYPES } from '../types';
import SlideRenderer from '../SlideRenderer';
import { GraphicMouseEventPayload, GraphicKeyboardEventPayload, GRAPHIC_EVENTS } from '../../events/types';

type RectangleRendererArgs = {
    id: string;
    slideRenderer: SlideRenderer;
    origin?: Vector;
    width?: number;
    height?: number;
    fillColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
    rotation?: number;
};

const DEFAULT_ARGS = {
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
    private _slideRenderer: SlideRenderer;
    private _svg: SVG.Rect | undefined;
    private _type: string;
    private _origin: Vector;
    private _width: number;
    private _height: number;
    private _fillColor: string;
    private _strokeColor: string;
    private _strokeWidth: number;
    private _rotation: number;

    constructor(args: RectangleRendererArgs) {
        this._id = args.id;
        this._slideRenderer = args.slideRenderer;
        this._type = GRAPHIC_TYPES.RECTANGLE;
        this._origin = args.origin || DEFAULT_ARGS.origin;
        this._width = args.width || DEFAULT_ARGS.width;
        this._height = args.height || DEFAULT_ARGS.height;
        this._fillColor = args.fillColor || DEFAULT_ARGS.fillColor;
        this._strokeColor = args.strokeColor || DEFAULT_ARGS.strokeColor;
        this._strokeWidth = args.strokeWidth || DEFAULT_ARGS.strokeWidth;
        this._rotation = args.rotation || DEFAULT_ARGS.rotation;
    }

    // TODO: Determine if slide events need to be propagated here
    private _decorateGraphicEvents(): void {
        this._svg && this._svg.node.addEventListener('mouseup', baseEvent => {
            document.dispatchEvent(new CustomEvent<GraphicMouseEventPayload>(GRAPHIC_EVENTS.MOUSEUP, {
                detail: {
                    slideRenderer: this._slideRenderer,
                    graphicId: this._id,
                    baseEvent
                }
            }));
        });

        this._svg && this._svg.node.addEventListener('mousedown', baseEvent => {
            document.dispatchEvent(new CustomEvent<GraphicMouseEventPayload>(GRAPHIC_EVENTS.MOUSEDOWN, {
                detail: {
                    slideRenderer: this._slideRenderer,
                    graphicId: this._id,
                    baseEvent
                }
            }));
        });

        this._svg && this._svg.node.addEventListener('mouseover', baseEvent => {
            document.dispatchEvent(new CustomEvent<GraphicMouseEventPayload>(GRAPHIC_EVENTS.MOUSEOVER, {
                detail: {
                    slideRenderer: this._slideRenderer,
                    graphicId: this._id,
                    baseEvent
                }
            }));
        });

        this._svg && this._svg.node.addEventListener('mouseout', baseEvent => {
            document.dispatchEvent(new CustomEvent<GraphicMouseEventPayload>(GRAPHIC_EVENTS.MOUSEOUT, {
                detail: {
                    slideRenderer: this._slideRenderer,
                    graphicId: this._id,
                    baseEvent
                }
            }));
        });

        this._svg && this._svg.node.addEventListener('mousemove', baseEvent => {
            document.dispatchEvent(new CustomEvent<GraphicMouseEventPayload>(GRAPHIC_EVENTS.MOUSEMOVE, {
                detail: {
                    slideRenderer: this._slideRenderer,
                    graphicId: this._id,
                    baseEvent
                }
            }));
        });

        this._svg && this._svg.node.addEventListener('keyup', baseEvent => {
            document.dispatchEvent(new CustomEvent<GraphicKeyboardEventPayload>(GRAPHIC_EVENTS.KEYUP, {
                detail: {
                    slideRenderer: this._slideRenderer,
                    graphicId: this._id,
                    baseEvent
                }
            }));
        });

        this._svg && this._svg.node.addEventListener('keydown', baseEvent => {
            document.dispatchEvent(new CustomEvent<GraphicKeyboardEventPayload>(GRAPHIC_EVENTS.KEYDOWN, {
                detail: {
                    slideRenderer: this._slideRenderer,
                    graphicId: this._id,
                    baseEvent
                }
            }));
        });
    }

    public get id(): string {
        return this._id;
    }

    public get type(): string {
        return this._type;
    }

    public get isRendered(): boolean {
        return this._svg !== undefined;
    }

    public get origin(): Vector {
        return this._origin;
    }

    public set origin(origin: Vector) {
        this._origin = origin;
        this._svg && this._svg.rotate(0).translate(this._origin.x, this._origin.y).rotate(this._rotation);
    }

    public get width(): number {
        return this._width;
    }

    public set width(width: number) {
        this._width = width;
        this._svg && this._svg.width(this._width);
    }

    public get height(): number {
        return this._height;
    }

    public set height(height: number) {
        this._height = height;
        this._svg && this._svg.height(this._height);
    }

    public get fillColor(): string {
        return this._fillColor;
    }

    public set fillColor(fillColor: string) {
        this._fillColor = fillColor;
        this._svg && this._svg.fill(this._fillColor);
    }

    public get strokeColor(): string {
        return this._strokeColor;
    }

    public set strokeColor(strokeColor: string) {
        this._strokeColor = strokeColor;
        this._svg && this._svg.stroke({ color: this._strokeColor, width: this._strokeWidth });
    }

    public get strokeWidth(): number {
        return this._strokeWidth;
    }

    public set strokeWidth(strokeWidth: number) {
        this._strokeWidth = strokeWidth;
        this._svg && this._svg.stroke({ color: this._strokeColor, width: this._strokeWidth });
    }

    public get rotation(): number {
        return this._rotation;
    }

    public set rotation(rotation: number) {
        this._rotation = rotation;
        this._svg && this._svg.rotate(this._rotation);
    }

    public render(): void {
        // Silently fail if the SVG is already rendered
        if (this.isRendered) {
            return;
        }

        this._svg = this._slideRenderer.canvas.rect(this._width, this._height)
            .translate(this._origin.x, this._origin.y)
            .fill(this._fillColor)
            .stroke({ color: this._strokeColor, width: this._strokeWidth })
            .rotate(this._rotation);
        this._decorateGraphicEvents();
    }

    public unrender(): void {
        this._svg && this._svg.remove();
        this._svg = undefined;
    }
}

export default RectangleRenderer;
