import * as SVG from 'svg.js';
import { SlideKeyboardEventPayload, SlideMouseEventPayload, SLIDE_EVENTS } from '../events/types';
import Vector from '../utilities/Vector';
import { CanvasRenderer } from './helpers';
import { GraphicRenderer } from './types';

type SlideRendererArgs = {
    canvas: SVG.Doc;
};

class SlideRenderer {
    private _canvas: SVG.Doc;
    private _graphics: { [index: string]: GraphicRenderer };

    constructor(args: SlideRendererArgs) {
        this._canvas = args.canvas;
        this._graphics = {};

        this._decorateSlideEvents();
    }

    private _decorateSlideEvents(): void {
        this._canvas.node.addEventListener('mouseup', baseEvent => {
            document.dispatchEvent(new CustomEvent<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEUP, {
                detail: {
                    slideRenderer: this,
                    baseEvent
                }
            }));
        });

        this._canvas.node.addEventListener('mousedown', baseEvent => {
            document.dispatchEvent(new CustomEvent<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEDOWN, {
                detail: {
                    slideRenderer: this,
                    baseEvent
                }
            }));
        });

        this._canvas.node.addEventListener('mouseover', baseEvent => {
            document.dispatchEvent(new CustomEvent<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEOVER, {
                detail: {
                    slideRenderer: this,
                    baseEvent
                }
            }));
        });

        this._canvas.node.addEventListener('mouseout', baseEvent => {
            document.dispatchEvent(new CustomEvent<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEOUT, {
                detail: {
                    slideRenderer: this,
                    baseEvent
                }
            }));
        });

        this._canvas.node.addEventListener('mousemove', baseEvent => {
            document.dispatchEvent(new CustomEvent<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEMOVE, {
                detail: {
                    slideRenderer: this,
                    baseEvent
                }
            }));
        });

        this._canvas.node.addEventListener('keyup', baseEvent => {
            document.dispatchEvent(new CustomEvent<SlideKeyboardEventPayload>(SLIDE_EVENTS.KEYUP, {
                detail: {
                    slideRenderer: this,
                    baseEvent
                }
            }));
        });

        this._canvas.node.addEventListener('keydown', baseEvent => {
            document.dispatchEvent(new CustomEvent<SlideKeyboardEventPayload>(SLIDE_EVENTS.KEYDOWN, {
                detail: {
                    slideRenderer: this,
                    baseEvent
                }
            }));
        });
    }

    public get canvas(): SVG.Doc {
        return this._canvas;
    }

    public set canvas(canvas: SVG.Doc) {
        this._canvas = canvas;
    }

    public get bounds(): { origin: Vector, height: number, width: number } {
        const bounds = this._canvas.node.getBoundingClientRect() as DOMRect;
        return { origin: new Vector(bounds.x, bounds.y), width: bounds.width, height: bounds.height };
    }

    public renderBackdrop(width: number, height: number): void {
        new CanvasRenderer({
            canvas: this._canvas,
            origin: Vector.zero,
            width,
            height
        }).render();
    }

    public persistGraphic(graphic: GraphicRenderer): void {
        this._graphics[graphic.id] = graphic;
    }
}

export default SlideRenderer;
