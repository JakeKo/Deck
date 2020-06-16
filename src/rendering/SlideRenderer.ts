import * as SVG from 'svg.js';
import { GraphicRenderer } from './types';
import RectangleRenderer from './graphics/RectangleRenderer';
import RectangleMaker from './makers/RectangleMaker';
import RectangleMutator from './mutators/RectangleMutator';
import CurveMaker from './makers/CurveMaker';
import CurveRenderer from './graphics/CurveRenderer';
import CurveMutator from './mutators/CurveMutator';
import { SlideMouseEventPayload, SlideKeyboardEventPayload } from '../events/types';
import { SLIDE_EVENTS } from '../events/constants';
import Vector from '../models/Vector';

type SlideRendererArgs = {
    canvas: SVG.Doc;
}

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
            document.dispatchEvent(new CustomEvent<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEUP, { detail: {
                slideRenderer: this,
                baseEvent
            }}));
        });
        
        this._canvas.node.addEventListener('mousedown', baseEvent => {
            document.dispatchEvent(new CustomEvent<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEDOWN, { detail: {
                slideRenderer: this,
                baseEvent
            }}));
        });
        
        this._canvas.node.addEventListener('mouseover', baseEvent => {
            document.dispatchEvent(new CustomEvent<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEOVER, { detail: {
                slideRenderer: this,
                baseEvent
            }}));
        });
        
        this._canvas.node.addEventListener('mouseout', baseEvent => {
            document.dispatchEvent(new CustomEvent<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEOUT, { detail: {
                slideRenderer: this,
                baseEvent
            }}));
        });
        
        this._canvas.node.addEventListener('mousemove', baseEvent => {
            document.dispatchEvent(new CustomEvent<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEMOVE, { detail: {
                slideRenderer: this,
                baseEvent
            }}));
        });
        
        this._canvas.node.addEventListener('keyup', baseEvent => {
            document.dispatchEvent(new CustomEvent<SlideKeyboardEventPayload>(SLIDE_EVENTS.KEYUP, { detail: {
                slideRenderer: this,
                baseEvent
            }}));
        });
        
        this._canvas.node.addEventListener('keydown', baseEvent => {
            document.dispatchEvent(new CustomEvent<SlideKeyboardEventPayload>(SLIDE_EVENTS.KEYDOWN, { detail: {
                slideRenderer: this,
                baseEvent
            }}));
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

    // TODO: Implement ID provider
    public startMakingRectangle(): RectangleMaker {
        const id = Math.random().toString();
        this._graphics[id] = new RectangleRenderer({ id, slideRenderer: this });
        this._graphics[id].render();

        return new RectangleMaker({ rectangle: this._graphics[id] as RectangleRenderer, slide: this });
    }

    public startMutatingRectangle(id: string): RectangleMutator {
        return new RectangleMutator({ rectangle: this._graphics[id] as RectangleRenderer, slide: this });
    }

    public startMakingCurve(): CurveMaker {
        const id = Math.random().toString();
        this._graphics[id] = new CurveRenderer({ id, slideRenderer: this });
        this._graphics[id].render();

        return new CurveMaker({ curve: this._graphics[id] as CurveRenderer, slide: this });
    }

    public startMutatingCurve(id: string): CurveMutator {
        return new CurveMutator({ curve: this._graphics[id] as CurveRenderer, slide: this });
    }
}

export default SlideRenderer;
