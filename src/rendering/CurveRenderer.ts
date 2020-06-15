import * as SVG from 'svg.js';
import { GraphicRenderer, AnchorHandler } from "./types";
import Vector from '../models/Vector';
import AnchorRenderer from './AnchorRenderer';
import { GRAPHIC_TYPES, GRAPHIC_ROLES } from './constants';

type CurveRendererArgs = {
    id: string;
    canvas: SVG.Doc;
    role?: string;
    segments: CurveSegment[];
    fillColor: string;
    strokeColor: string;
    strokeWidth: number;
    rotation: number;
};

type CurveSegment = {
    inHandle: Vector | undefined;
    point: Vector;
    outHandle: Vector | undefined;
};

type CurveSegmentAnchor = {
    inHandle: {
        initializeHandler: () => AnchorHandler;
        graphic: AnchorRenderer;
    } | undefined,
    point: {
        initializeHandler: () => AnchorHandler;
        graphic: AnchorRenderer;
    },
    outHandle: {
        initializeHandler: () => AnchorHandler;
        graphic: AnchorRenderer;
    } | undefined
};

const DEFAULT_ARGS = {
    role: GRAPHIC_ROLES.STANDARD,
    segments: [],
    fillColor: '#FFFFFF',
    strokeColor: '#000000',
    strokeWidth: 1,
    rotation: 0
};

class CurveRenderer implements GraphicRenderer {
    private _id: string;
    private _canvas: SVG.Doc;
    private _svg: SVG.Path | undefined;
    private _type: string;
    private _role: string;
    private _segments: CurveSegment[];
    private _fillColor: string;
    private _strokeColor: string;
    private _strokeWidth: number;
    private _rotation: number;
    private _anchors: CurveSegmentAnchor[];

    constructor(args: CurveRendererArgs) {
        this._id = args.id;
        this._canvas = args.canvas;
        this._type = GRAPHIC_TYPES.CURVE;
        this._role = args.role || DEFAULT_ARGS.role;
        this._segments = args.segments || DEFAULT_ARGS.segments;
        this._fillColor = args.fillColor || DEFAULT_ARGS.fillColor;
        this._strokeColor = args.strokeColor || DEFAULT_ARGS.strokeColor;
        this._strokeWidth = args.strokeWidth || DEFAULT_ARGS.strokeWidth;
        this._rotation = args.rotation || DEFAULT_ARGS.rotation;
        this._anchors = this._segments.map(this.createSegmentAnchor);
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
    
    public set fillColor(fillColor: string) {
        // Update property
        this._fillColor = fillColor;

        // Update SVG if it exists
        this._svg?.fill(this._fillColor);
    }
    
    public set strokeColor(strokeColor: string) {
        // Update property
        this._strokeColor = strokeColor;

        // Update SVG if it exists
        this._svg?.stroke({
            color: this._strokeColor,
            width: this._strokeWidth
        });
    }
    
    public set strokeWidth(strokeWidth: number) {
        // Update property
        this._strokeWidth = strokeWidth;

        // Update SVG if it exists
        this._svg?.stroke({
            color: this._strokeColor,
            width: this._strokeWidth
        });
    }
    
    public set rotation(rotation: number) {
        // Update property
        this._rotation = rotation;

        // Update SVG if it exists
        this._svg?.rotate(this._rotation);
    }
    
    public render(): void {
        // Silently fail if the SVG is already rendered
        if (this.isRendered) {
            return;
        }

        this._svg = this._canvas.path(this._formattedPoints)
            .fill(this._fillColor)
            .stroke({ color: this._strokeColor, width: this._strokeWidth })
            .rotate(this._rotation);
    }

    public unrender(): void {
        this._svg?.remove();
        this._svg = undefined;
    }

    public showFocus(): void {
        this._anchors.forEach(anchor => {
            anchor.inHandle?.graphic.render();
            anchor.point.graphic.render();
            anchor.outHandle?.graphic.render();
        });
    }

    public hideFocus(): void {
        this._anchors.forEach(anchor => {
            anchor.inHandle?.graphic.unrender();
            anchor.point.graphic.unrender();
            anchor.outHandle?.graphic.unrender();
        });
    }

    public moveCurve(origin: Vector) {
        const changeInPosition = this._segments[0].point.towards(origin);
        this._segments = this._segments.map(segment => ({
            inHandle: segment.inHandle?.add(changeInPosition),
            point: segment.point.add(changeInPosition),
            outHandle: segment.outHandle?.add(changeInPosition)
        }));

        // Update SVG if it exists
        this._svg?.plot(this._formattedPoints);
    }

    public addSegment(segment: CurveSegment): number {
        this._segments.push(segment);
        this._anchors.push(this.createSegmentAnchor(segment));

        return this._segments.length - 1;
    }

    // TODO: Make this better
    public setSegment(index: number, segment: CurveSegment): void {
        this._segments[index] = segment;

        const anchor = this._anchors[index];
        if (segment.inHandle === undefined) {
            // Unrender the inHandle graphic (if it existed)
            anchor.inHandle?.graphic.unrender();
            anchor.inHandle = undefined;
        } else {
            if (anchor.inHandle === undefined) {
                anchor.inHandle = {
                    initializeHandler: () => () => { },
                    graphic: new AnchorRenderer({ canvas: this._canvas, center: segment.inHandle })
                };
            } else {
                anchor.inHandle.graphic.center = segment.inHandle;
            }
        }

        // point was defined, point is defined
        this._anchors[index].point.graphic.center = segment.point;

        if (segment.outHandle === undefined) {
            // Unrender the outHandle graphic (if it existed)
            anchor.outHandle?.graphic.unrender();
            anchor.outHandle = undefined;
        } else {
            if (anchor.outHandle === undefined) {
                anchor.outHandle = {
                    initializeHandler: () => () => { },
                    graphic: new AnchorRenderer({ canvas: this._canvas, center: segment.outHandle })
                };
            } else {
                anchor.outHandle.graphic.center = segment.outHandle;
            }
        }
    }

    // Reformat points from an array of objects to the bezier curve string
    private get _formattedPoints(): string {
        const segmentPoints = this._segments.map(s => [s.inHandle, s.point, s.outHandle].filter(p => p !== undefined) as Vector[]);
        const [origin, ...points] = segmentPoints.reduce((points, segment) => [...points, ...segment]);
        return `M ${origin.x},${origin.y} ${points.map(({ x, y }, i) => `${i % 3 === 0 ? ' C' : ''} ${x},${y}`)}`;
    }

    private createSegmentAnchor(segment: CurveSegment): CurveSegmentAnchor {
        return {
            inHandle: segment.inHandle === undefined ? undefined : {
                initializeHandler: () => () => { },
                graphic: new AnchorRenderer({ canvas: this._canvas, center: segment.inHandle })
            },
            point: {
                initializeHandler: () => () => { },
                graphic: new AnchorRenderer({ canvas: this._canvas, center: segment.point })
            },
            outHandle: segment.outHandle === undefined ? undefined : {
                initializeHandler: () => () => { },
                graphic: new AnchorRenderer({ canvas: this._canvas, center: segment.outHandle })
            }
        };
    } 
}

export default CurveRenderer;
