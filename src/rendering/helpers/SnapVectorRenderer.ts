import SnapVector from '@/utilities/SnapVector';
import { GRAPHIC_TYPES, ISlideRenderer, ISnapVectorRenderer } from '../types';

class SnapVectorRenderer implements ISnapVectorRenderer {
    public readonly type = GRAPHIC_TYPES.SNAP_VECTOR;
    private _slide: ISlideRenderer;
    private _line: SVGLineElement | undefined;
    private _point: SVGEllipseElement | undefined;
    private _color = 'crimson';
    private _lineWidth = 1;
    private _lineScale = 250;
    private _lineDashArray = '10,10';
    private _lineCap = 'round';
    private _pointFill = '#FFFFFF';
    private _pointRadius = 4;
    private _scale: number;
    private _snapVector: SnapVector;

    constructor(args: {
        scale: number;
        slide: ISlideRenderer;
        snapVector: SnapVector;
    }) {
        this._scale = args.scale;
        this._slide = args.slide;
        this._snapVector = args.snapVector;
    }

    public get isRendered(): boolean {
        return this._line !== undefined && this._point !== undefined;
    }

    public set scale(scale: number) {
        this._scale = scale;

        if (this._line && this._point) {
            this._line.setAttribute('stroke-width', (this._lineWidth * this._scale).toString());
            this._point.setAttribute('rx', (this._pointRadius * this._scale).toString());
            this._point.setAttribute('ry', (this._pointRadius * this._scale).toString());
            this._point.setAttribute('stroke-width', (this._lineWidth * this._scale).toString());
        }
    }

    public set snapVector(snapVector: SnapVector) {
        this._snapVector = snapVector;

        if (this._line && this._point) {
            const first = this._snapVector.origin.add(this._snapVector.direction.scale(this._lineScale));
            const second = this._snapVector.origin.add(this._snapVector.direction.scale(-this._lineScale));
            this._line.setAttribute('x1', first.x.toString());
            this._line.setAttribute('y1', first.y.toString());
            this._line.setAttribute('x2', second.x.toString());
            this._line.setAttribute('y2', second.y.toString());

            this._point.setAttribute('cx', this._snapVector.origin.x.toString());
            this._point.setAttribute('cy', this._snapVector.origin.y.toString());
        }
    }

    public render(): void {
        // Silently fail if the SVG is already rendered
        if (this.isRendered) {
            return;
        }

        const first = this._snapVector.origin.add(this._snapVector.direction.scale(this._lineScale));
        const second = this._snapVector.origin.add(this._snapVector.direction.scale(-this._lineScale));
        this._line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        this._line.setAttribute('x1', first.x.toString());
        this._line.setAttribute('y1', first.y.toString());
        this._line.setAttribute('x2', second.x.toString());
        this._line.setAttribute('y2', second.y.toString());
        this._line.setAttribute('stroke', this._color);
        this._line.setAttribute('stroke-width', (this._lineWidth * this._scale).toString());
        this._line.setAttribute('stroke-linecap', this._lineCap);
        this._line.setAttribute('stroke-dasharray', this._lineDashArray);

        this._point = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        this._point.setAttribute('cx', this._snapVector.origin.x.toString());
        this._point.setAttribute('cy', this._snapVector.origin.y.toString());
        this._point.setAttribute('rx', (this._pointRadius * this._scale).toString());
        this._point.setAttribute('ry', (this._pointRadius * this._scale).toString());
        this._point.setAttribute('fill', this._pointFill);
        this._point.setAttribute('stroke', this._color.toString());
        this._point.setAttribute('stroke-width', (this._lineWidth * this._scale).toString());

        this._slide.canvas.node.appendChild(this._line);
        this._slide.canvas.node.appendChild(this._point);
    }

    public unrender(): void {
        this._line && this._line.remove();
        this._point && this._point.remove();
        this._line = undefined;
        this._point = undefined;
    }
}

export default SnapVectorRenderer;
