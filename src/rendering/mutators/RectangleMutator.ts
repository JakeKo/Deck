import { SlideMouseEvent } from '@/events/types';
import { resolvePosition } from '@/tools/utilities';
import { closestVector, mod } from '@/utilities/utilities';
import Vector from '@/utilities/Vector';
import {
    BoundingBoxMutatorHelpers,
    GRAPHIC_TYPES,
    IRectangleMutator,
    IRectangleRenderer,
    ISlideRenderer,
    VERTEX_ROLES
} from '../types';
import {
    makeBoxHelpers,
    renderBoxHelpers,
    resizeBoxHelpers,
    rotateBoxHelpers,
    scaleBoxHelpers,
    unrenderBoxHelpers
} from '../utilities';

type RectangleMutatorArgs = {
    target: IRectangleRenderer;
    slide: ISlideRenderer;
    scale: number;
};

class RectangleMutator implements IRectangleMutator {
    public readonly type = GRAPHIC_TYPES.RECTANGLE;
    public readonly target: IRectangleRenderer;
    private _helpers: BoundingBoxMutatorHelpers;

    constructor(args: RectangleMutatorArgs) {
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
        const box = this.target.box;
        const directions = [
            box.dimensions,
            box.dimensions.signAs(Vector.northwest),
            box.dimensions.signAs(Vector.southwest),
            box.dimensions.signAs(Vector.southeast)
        ].map(direction => direction.rotateMore(box.rotation));

        // 1. Resolve the slide-relative mouse position
        // 2. Create a vector which represents how to change the respective corner
        // 3. Constrain the vector (to maintain aspect ratio) if shift is pressed
        // 4. Unrotate the corner vector to correct for graphic rotation
        // 5. Use the post-shift corner vector and corrected corner vector to update props
        const makeListener = (oppositeCorner: Vector): (event: SlideMouseEvent) => void => {
            return event => {
                const { baseEvent, slide } = event.detail;
                const position = resolvePosition(baseEvent, slide);
                const rawCornerVector = oppositeCorner.towards(position);
                const cornerVector = baseEvent.shiftKey ? rawCornerVector.projectOn(closestVector(rawCornerVector, directions)) : rawCornerVector;
                const correctedCornerVector = cornerVector.rotateMore(-box.rotation);

                const dimensions = correctedCornerVector.abs;
                const center = oppositeCorner.add(cornerVector.scale(0.5));
                const origin = center.add(dimensions.scale(-0.5));

                // Update rendering
                this.target.setOriginAndDimensions(origin, dimensions);
                slide.broadcastSetGraphic(this.target);
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
        const { center } = this.target.box;
        const directions = [...Vector.cardinals, ...Vector.intermediates];

        return event => {
            const { slide, baseEvent } = event.detail;
            const position = resolvePosition(baseEvent, slide);
            const rawOffset = center.towards(position);
            const offset = baseEvent.shiftKey ? closestVector(rawOffset, directions) : rawOffset;
            const theta = Math.atan2(offset.y, offset.x);

            this.target.rotation = mod(theta, Math.PI * 2);
            slide.broadcastSetGraphic(this.target);
            rotateBoxHelpers(this._helpers, this.target.box);
        };
    }

    // TODO: Account for alt and snapping
    public moveListener(initialPosition: Vector): (event: SlideMouseEvent) => void {
        const initialOrigin = this.target.origin;
        const offset = initialPosition.towards(initialOrigin);
        const directions = [...Vector.cardinals, ...Vector.intermediates];

        return event => {
            const { slide, baseEvent } = event.detail;
            const rawMove = initialOrigin.towards(resolvePosition(baseEvent, slide).add(offset));
            const moveDirection = (baseEvent.shiftKey ? closestVector(rawMove, directions) : rawMove).normalized;
            const move = rawMove.projectOn(moveDirection);

            this.target.origin = initialOrigin.add(move);
            this._repositionBoxHelpers();
        };
    }

    // TODO: Include methods for other mutations

    public complete(): void {
        // Remove helper graphics
        unrenderBoxHelpers(this._helpers);
    }

    private _repositionBoxHelpers(): void {
        resizeBoxHelpers(this._helpers, this.target.box);
    }
}

export default RectangleMutator;
