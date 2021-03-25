import { SlideMouseEvent } from '@/events/types';
import { resolvePosition } from '@/tools/utilities';
import { EllipseMutableSerialized } from '@/types';
import { closestVector, mod } from '@/utilities/utilities';
import V from '@/utilities/Vector';
import { GRAPHIC_TYPES, IEllipseMutator, IEllipseRenderer, ISlideRenderer, VERTEX_ROLES } from '../types';
import { calculateMove, resizeBoxHelpers, rotateBoxHelpers, updateSnapVectors } from '../utilities';
import GraphicMutatorBase from './GraphicMutatorBase';

class EllipseMutator extends GraphicMutatorBase<GRAPHIC_TYPES.ELLIPSE, IEllipseRenderer, EllipseMutableSerialized> implements IEllipseMutator {
    public readonly target: IEllipseRenderer;

    constructor({
        target,
        slide,
        scale,
        graphicId,
        focus = true
    }: {
        target: IEllipseRenderer;
        slide: ISlideRenderer;
        scale: number;
        graphicId: string;
        focus?: boolean;
    }) {
        super({ type: GRAPHIC_TYPES.ELLIPSE, slide, scale, graphicId, focus });
        this.target = target;
    }

    /**
     * Initialize this mutator to begin tracking movement.
     * This returns a handler to be called on each subsequent mouse event.
     */
    public initMove(initialPosition: V): (event: SlideMouseEvent) => EllipseMutableSerialized {
        this.isMoving = true;
        const graphic = this.graphic;
        const initialOrigin = graphic.center;
        const relativePullPoints = graphic.pullPoints.map(p => initialPosition.towards(p));
        const snapVectors = this.slide.getSnapVectors([graphic.id]);

        return event => {
            const { shift: move, snapVectors: newSnapVectors } = calculateMove({
                initialOrigin,
                initialPosition,
                mouseEvent: event,
                snapVectors,
                relativePullPoints
            });

            // TODO: Consider how to move snap vector updates out of calculator
            updateSnapVectors(newSnapVectors, this.helpers.snapVectors);
            return { center: initialOrigin.add(move) };
        };
    }

    /**
     * Conclude tracking of movement.
     */
    public endMove(): void {
        this.isMoving = false;
        updateSnapVectors([], this.helpers.snapVectors);
    }

    // TODO: Account for ctrl, alt, and snapping
    /**
     * Initialize this mutator to begin tracking vertex movement.
     * This returns a handler to be called on each subsequent mouse event.
     */
    public initVertexMove(role: VERTEX_ROLES): (event: SlideMouseEvent) => EllipseMutableSerialized {
        this.isMovingVertex = true;
        const box = this.graphic.transformedBox;
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
        const makeListener = (oppositeCorner: V): (event: SlideMouseEvent) => EllipseMutableSerialized => {
            return event => {
                const { baseEvent, slide } = event.detail;
                const position = resolvePosition(baseEvent, slide);
                const rawCornerVector = oppositeCorner.towards(position);
                const cornerVector = baseEvent.shiftKey ? rawCornerVector.projectOn(closestVector(rawCornerVector, directions)) : rawCornerVector;
                const correctedCornerVector = cornerVector.rotate(-box.rotation);

                const dimensions = correctedCornerVector.abs;
                const center = oppositeCorner.add(cornerVector.scale(0.5));

                return { center, dimensions };
            };
        };

        return ({
            [VERTEX_ROLES.TOP_LEFT]: makeListener(box.bottomRight),
            [VERTEX_ROLES.TOP_RIGHT]: makeListener(box.bottomLeft),
            [VERTEX_ROLES.BOTTOM_LEFT]: makeListener(box.topRight),
            [VERTEX_ROLES.BOTTOM_RIGHT]: makeListener(box.topLeft)
        })[role];
    }

    /**
     * Conclude tracking of vertex movement.
     */
    public endVertexMove(): void {
        this.isMovingVertex = false;
    }

    public rotateListener(): (event: SlideMouseEvent) => EllipseMutableSerialized {
        const { center } = this.target.transformedBox;
        const directions = [...V.cardinals, ...V.intermediates];

        return event => {
            const { slide, baseEvent } = event.detail;
            const position = resolvePosition(baseEvent, slide);
            const rawOffset = center.towards(position);
            const offset = baseEvent.shiftKey ? closestVector(rawOffset, directions) : rawOffset;
            const theta = Math.atan2(offset.y, offset.x);

            this.target.rotation = mod(theta, Math.PI * 2);
            rotateBoxHelpers(this.helpers, this.target.transformedBox);

            return { rotation: this.target.rotation };
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
        rotateBoxHelpers(this.helpers, this.target.transformedBox);
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

    private _repositionBoxHelpers(): void {
        resizeBoxHelpers(this.helpers, this.target.transformedBox);
    }
}

export default EllipseMutator;
