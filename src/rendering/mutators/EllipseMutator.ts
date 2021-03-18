import { SlideMouseEvent } from '@/events/types';
import { resolvePosition } from '@/tools/utilities';
import { EllipseMutableSerialized } from '@/types';
import { closestVector, mod } from '@/utilities/utilities';
import V from '@/utilities/Vector';
import { SnapVectorRenderer } from '../helpers';
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
    makeSnapVectors,
    renderBoxHelpers,
    resizeBoxHelpers,
    rotateBoxHelpers,
    scaleBoxHelpers,
    unrenderBoxHelpers,
    updateBoxHelpers,
    updateSnapVectors
} from '../utilities';

class EllipseMutator implements IEllipseMutator {
    public readonly type = GRAPHIC_TYPES.ELLIPSE;
    public readonly target: IEllipseRenderer;

    private _helpers: BoundingBoxMutatorHelpers & { snapVectors: SnapVectorRenderer[] };
    private _graphicId: string;
    private _slide: ISlideRenderer;
    private _isFocusing: boolean;
    private _isMoving: boolean;

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
        this.target = target;
        this._graphicId = graphicId;
        this._slide = slide;
        this._isFocusing = false;
        this._isMoving = false;
        this._helpers = {
            ...makeBoxHelpers(this.target, this._slide, scale),
            snapVectors: makeSnapVectors(this._slide, scale)
        };

        if (focus) {
            this.focus();
        }
    }

    public set scale(scale: number) {
        scaleBoxHelpers(this._helpers, scale);
        this._helpers.snapVectors.forEach(s => (s.scale = scale));
    }

    /**
     * Updates the rendered helper graphics with the latest state of this mutator's targeted graphic.
     */
    public updateHelpers(): void {
        if (!this._isFocusing) {
            return;
        }

        const graphic = this._graphic;
        updateBoxHelpers(this._helpers, graphic.transformedBox);
    }

    /**
     * Focus the graphic that pertains to this mutator. This will render necessary helper graphics.
     */
    public focus(): void {
        if (this._isFocusing) {
            return;
        }

        this._isFocusing = true;
        renderBoxHelpers(this._helpers);
    }

    /**
     * Unfocus the graphic that pertains to this mutator. This will unrender all helper graphics.
     */
    public unfocus(): void {
        if (!this._isFocusing) {
            return;
        }

        this._isFocusing = false;
        unrenderBoxHelpers(this._helpers);
        this._helpers.snapVectors.forEach(s => s.unrender());
    }

    /**
     * Initialize this mutator to begin tracking movement. This returns a handler to be called on each subsequent mouse event.
     */
    public initMove(initialPosition: V): (event: SlideMouseEvent) => EllipseMutableSerialized {
        this._isMoving = true;
        const graphic = this._graphic;
        const initialOrigin = graphic.center;
        const relativePullPoints = graphic.pullPoints.map(p => initialPosition.towards(p));
        const snapVectors = this._slide.getSnapVectors([graphic.id]);

        return event => {
            const { shift: move, snapVectors: newSnapVectors } = calculateMove({
                initialOrigin,
                initialPosition,
                mouseEvent: event,
                snapVectors,
                relativePullPoints
            });

            // TODO: Consider how to move snap vector updates out of calculator
            updateSnapVectors(newSnapVectors, this._helpers.snapVectors);
            return { center: initialOrigin.add(move) };
        };
    }

    /**
     * Conclude tracking of movement.
     */
    public endMove(): void {
        this._isMoving = false;
    }

    // TODO: Account for ctrl, alt, and snapping
    public vertexListener(role: VERTEX_ROLES): (event: SlideMouseEvent) => EllipseMutableSerialized {
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
        const makeListener = (oppositeCorner: V): (event: SlideMouseEvent) => EllipseMutableSerialized => {
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

                return { center: this.target.center, dimensions: this.target.dimensions };
            };
        };

        return ({
            [VERTEX_ROLES.TOP_LEFT]: makeListener(box.bottomRight),
            [VERTEX_ROLES.TOP_RIGHT]: makeListener(box.bottomLeft),
            [VERTEX_ROLES.BOTTOM_LEFT]: makeListener(box.topRight),
            [VERTEX_ROLES.BOTTOM_RIGHT]: makeListener(box.topLeft)
        })[role];
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
            rotateBoxHelpers(this._helpers, this.target.transformedBox);

            return { rotation: this.target.rotation };
        };
    }

    public moveListener(initialPosition: V): (event: SlideMouseEvent) => EllipseMutableSerialized {
        const initialOrigin = this.target.center;
        const relativePullPoints = this.target.pullPoints.map(p => initialPosition.towards(p));
        const snapVectors = this._slide.getSnapVectors([this._graphicId]);

        return event => {
            const { shift: move, snapVectors: newSnapVectors } = calculateMove({
                initialOrigin,
                initialPosition,
                mouseEvent: event,
                snapVectors,
                relativePullPoints
            });

            this.target.center = initialOrigin.add(move);
            this._repositionBoxHelpers();
            updateSnapVectors(newSnapVectors, this._helpers.snapVectors);

            return { center: this.target.center };
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

    private get _graphic(): IEllipseRenderer {
        return this._slide.getGraphic(this._graphicId) as IEllipseRenderer;
    }

    private _repositionBoxHelpers(): void {
        resizeBoxHelpers(this._helpers, this.target.transformedBox);
    }
}

export default EllipseMutator;
