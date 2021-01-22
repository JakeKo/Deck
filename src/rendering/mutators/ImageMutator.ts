import { SlideMouseEvent } from '@/events/types';
import { resolvePosition } from '@/tools/utilities';
import SnapVector from '@/utilities/SnapVector';
import { closestVector, mod } from '@/utilities/utilities';
import Vector from '@/utilities/Vector';
import {
    BoundingBoxMutatorHelpers,
    GRAPHIC_TYPES,
    IImageMutator,
    IImageRenderer,
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

type ImageMutatorArgs = {
    target: IImageRenderer;
    slide: ISlideRenderer;
    scale: number;
};

class ImageMutator implements IImageMutator {
    public readonly type = GRAPHIC_TYPES.IMAGE;
    public readonly target: IImageRenderer;
    private _helpers: BoundingBoxMutatorHelpers;

    constructor(args: ImageMutatorArgs) {
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
            box.dimensions.signAs(Vector.northwest),
            box.dimensions.signAs(Vector.southwest),
            box.dimensions.signAs(Vector.southeast)
        ].map(direction => direction.rotateMore(box.rotation));

        // 1. Resolve the slide-relative mouse position
        // 2. Create a vector which represents how to change the respective corner
        // 3. Constrain the vector (to maintain aspect ratio)
        // 4. Unrotate the corner vector to correct for graphic rotation
        // 5. Use the post-shift corner vector and corrected corner vector to update props
        const makeListener = (oppositeCorner: Vector): (event: SlideMouseEvent) => void => {
            return event => {
                const { baseEvent, slide } = event.detail;
                const position = resolvePosition(baseEvent, slide);
                const rawCornerVector = oppositeCorner.towards(position);
                const cornerVector = rawCornerVector.projectOn(closestVector(rawCornerVector, directions));
                const correctedCornerVector = cornerVector.rotateMore(-box.rotation);

                const dimensions = correctedCornerVector.abs;
                const center = oppositeCorner.add(cornerVector.scale(0.5));
                const origin = center.add(dimensions.scale(-0.5));

                // Update rendering
                this.target.setOriginAndDimensions(origin, dimensions);
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
        const directions = [...Vector.cardinals, ...Vector.intermediates];

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

    public moveListener(initialPosition: Vector, snapVectors: SnapVector[]): (event: SlideMouseEvent) => void {
        const initialOrigin = this.target.origin;
        const relativePullPoints = this.target.pullPoints.map(p => initialPosition.towards(p));

        return event => {
            const move = calculateMove({
                initialOrigin,
                initialPosition,
                mouseEvent: event,
                snapVectors,
                relativePullPoints
            });

            this.target.origin = initialOrigin.add(move);
            this._repositionBoxHelpers();
        };
    }

    public setX(x: number): void {
        this.target.origin = new Vector(x, this.target.origin.y);
        this._repositionBoxHelpers();
    }

    public setY(y: number): void {
        this.target.origin = new Vector(this.target.origin.x, y);
        this._repositionBoxHelpers();
    }

    public setWidth(width: number): void {
        // When the width changes, we preserve aspect ratio
        const heightToWidth = this.target.dimensions.y / this.target.dimensions.x;
        this.target.dimensions = new Vector(width, width * heightToWidth);
        this._repositionBoxHelpers();
    }

    public setHeight(height: number): void {
        // When the height changes, we preserve aspect ratio
        const widthToHeight = this.target.dimensions.x / this.target.dimensions.y;
        this.target.dimensions = new Vector(height * widthToHeight, height);
        this._repositionBoxHelpers();
    }

    public setRotation(rotation: number): void {
        this.target.rotation = rotation;
        rotateBoxHelpers(this._helpers, this.target.transformedBox);
    }

    public complete(): void {
        // Remove helper graphics
        unrenderBoxHelpers(this._helpers);
    }

    private _repositionBoxHelpers(): void {
        resizeBoxHelpers(this._helpers, this.target.transformedBox);
    }
}

export default ImageMutator;
