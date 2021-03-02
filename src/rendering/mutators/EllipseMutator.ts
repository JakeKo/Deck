import { SlideMouseEvent } from '@/events/types';
import { resolvePosition } from '@/tools/utilities';
import SnapVector from '@/utilities/SnapVector';
import { closestVector, mod } from '@/utilities/utilities';
import V from '@/utilities/Vector';
import {
    BoundingBoxMutatorHelpers,
    GRAPHIC_TYPES,
    IEllipseMutator,
    IEllipseRenderer,
    ISlideRenderer,
    VERTEX_ROLES
} from '../types';
import {
    calculateMove,
    makeBoxHelpers,
    renderBoxHelpers,
    resizeBoxHelpers,
    rotateBoxHelpers,
    scaleBoxHelpers,
    unrenderBoxHelpers
} from '../utilities';

type EllipseMutatorArgs = {
    target: IEllipseRenderer;
    slide: ISlideRenderer;
    scale: number;
};

class EllipseMutator implements IEllipseMutator {
    public readonly type = GRAPHIC_TYPES.ELLIPSE;
    public readonly target: IEllipseRenderer;
    private _helpers: BoundingBoxMutatorHelpers;

    constructor(args: EllipseMutatorArgs) {
        this.target = args.target;

        // Initialize helper graphics
        this._helpers = makeBoxHelpers(this.target, args.slide, args.scale);

        // Render helper graphics
        renderBoxHelpers(this._helpers);
    }

    public set scale(scale: number) {
        scaleBoxHelpers(this._helpers, scale);
    }

    // TODO: Account for ctrl, alt, and snapping
    public vertexListener(role: VERTEX_ROLES): (event: SlideMouseEvent) => void {
        const box = this.target.transformedBox;
        const directions = [
            box.dimensions,
            box.dimensions.signAs(V.northwest),
            box.dimensions.signAs(V.southwest),
            box.dimensions.signAs(V.southeast)
        ].map(direction => direction.rotate(box.rotation));

        // 1. Resolve the slide-relative mouse position
        // 2. Create a vector which represents how to change the respective corner
        // 3. Constrain the vector (to maintain aspect ratio) if shift is pressed
        // 4. Unrotate the corner vector to correct for graphic rotation
        // 5. Use the post-shift corner vector and corrected corner vector to update props
        const makeListener = (oppositeCorner: V): (event: SlideMouseEvent) => void => {
            return event => {
                const { baseEvent, slide } = event.detail;
                const position = resolvePosition(baseEvent, slide);
                const rawCornerVector = oppositeCorner.towards(position);
                const cornerVector = baseEvent.shiftKey ? rawCornerVector.projectOn(closestVector(rawCornerVector, directions)) : rawCornerVector;
                const correctedCornerVector = cornerVector.rotate(-box.rotation);

                const dimensions = correctedCornerVector.abs;
                const center = oppositeCorner.add(cornerVector.scale(0.5));

                // Update rendering
                this.target.setCenterAndDimensions(center, dimensions);
                this._repositionBoxHelpers();
            };
        };

        return ({
            [VERTEX_ROLES.TOP_LEFT]: makeListener(box.bottomRight),
            [VERTEX_ROLES.TOP_RIGHT]: makeListener(box.bottomLeft),
            [VERTEX_ROLES.BOTTOM_LEFT]: makeListener(box.topRight),
            [VERTEX_ROLES.BOTTOM_RIGHT]: makeListener(box.topLeft)
        })[role];
    }

    public rotateListener(): (event: SlideMouseEvent) => void {
        const { center } = this.target.transformedBox;
        const directions = [...V.cardinals, ...V.intermediates];

        return event => {
            const { slide, baseEvent } = event.detail;
            const position = resolvePosition(baseEvent, slide);
            const rawOffset = center.towards(position);
            const offset = baseEvent.shiftKey ? closestVector(rawOffset, directions) : rawOffset;
            const theta = Math.atan2(offset.y, offset.x);

            this.target.rotation = mod(theta, Math.PI * 2);
            rotateBoxHelpers(this._helpers, this.target.transformedBox);
        };
    }

    public moveListener(initialPosition: V, snapVectors: SnapVector[]): (event: SlideMouseEvent) => void {
        const initialOrigin = this.target.center;
        const relativePullPoints = this.target.pullPoints.map(p => initialPosition.towards(p));

        return event => {
            const move = calculateMove({
                initialOrigin,
                initialPosition,
                mouseEvent: event,
                snapVectors,
                relativePullPoints
            });

            this.target.center = initialOrigin.add(move);
            this._repositionBoxHelpers();
        };
    }

    public setX(x: number): void {
        this.target.center = new V(x, this.target.center.y);
        this._repositionBoxHelpers();
    }

    public setY(y: number): void {
        this.target.center = new V(this.target.center.x, y);
        this._repositionBoxHelpers();
    }

    public setWidth(width: number): void {
        this.target.dimensions = new V(width, this.target.dimensions.y);
        this._repositionBoxHelpers();
    }

    public setHeight(height: number): void {
        this.target.dimensions = new V(this.target.dimensions.x, height);
        this._repositionBoxHelpers();
    }

    public setRotation(rotation: number): void {
        this.target.rotation = rotation;
        rotateBoxHelpers(this._helpers, this.target.transformedBox);
    }

    public setFillColor(fillColor: string): void {
        this.target.fillColor = fillColor;
    }

    public setStrokeColor(strokeColor: string): void {
        this.target.strokeColor = strokeColor;
    }

    public setStrokeWidth(strokeWidth: number): void {
        this.target.strokeWidth = strokeWidth;
    }

    public complete(): void {
        // Remove helper graphics
        unrenderBoxHelpers(this._helpers);
    }

    private _repositionBoxHelpers(): void {
        resizeBoxHelpers(this._helpers, this.target.transformedBox);
    }
}

export default EllipseMutator;
