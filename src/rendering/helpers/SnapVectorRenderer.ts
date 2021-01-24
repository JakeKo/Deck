import SnapVector from '@/utilities/SnapVector';
import { GRAPHIC_TYPES, ISnapVectorRenderer, ISlideRenderer } from '../types';

class SnapVectorRenderer implements ISnapVectorRenderer {
    public readonly type = GRAPHIC_TYPES.SNAP_VECTOR;
    private _slide: ISlideRenderer;
    private _line: SVGLineElement | undefined;
    private _point: SVGEllipseElement | undefined;
    private _color = 'red';
    private _lineWidth = 2;
    private _pointRadius = 4;
    private _snapVector: SnapVector;

    constructor(args: {
        slide: ISlideRenderer;
        snapVector: SnapVector;
    }) {
        this._slide = args.slide;
        this._snapVector = args.snapVector;
    }

    public get isRendered(): boolean {
        return this._line !== undefined && this._point !== undefined;
    }
    
    public set snapVector(snapVector: SnapVector) {
        this._snapVector = snapVector;

        const first = this._snapVector.origin.add(this._snapVector.direction.scale(1000));
        const second = this._snapVector.origin.add(this._snapVector.direction.scale(-1000));
        this._line && this._line.setAttribute('x1', first.x.toString());
        this._line && this._line.setAttribute('y1', first.x.toString());
        this._line && this._line.setAttribute('x2', second.x.toString());
        this._line && this._line.setAttribute('y2', second.x.toString());

        this._point && this._point.setAttribute('cx', this._snapVector.origin.x.toString());
        this._point && this._point.setAttribute('cy', this._snapVector.origin.y.toString());
    }

    public render(): void {
        // Silently fail if the SVG is already rendered
        if (this.isRendered) {
            return;
        }

        const first = this._snapVector.origin.add(this._snapVector.direction.scale(1000));
        const second = this._snapVector.origin.add(this._snapVector.direction.scale(-1000));
        this._line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        this._line.setAttribute('x1', first.x.toString());
        this._line.setAttribute('y1', first.x.toString());
        this._line.setAttribute('x2', second.x.toString());
        this._line.setAttribute('y2', second.x.toString());
        this._line.setAttribute('stroke', this._color);
        this._line.setAttribute('stroke-width', this._lineWidth.toString());

        this._point = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        this._point.setAttribute('cx', this._snapVector.origin.x.toString());
        this._point.setAttribute('cy', this._snapVector.origin.y.toString());
        this._point.setAttribute('rx', this._pointRadius.toString());
        this._point.setAttribute('ry', this._pointRadius.toString());
        this._point.setAttribute('stroke-color', this._color);
        this._point.setAttribute('stroke-width', this._lineWidth.toString());

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
