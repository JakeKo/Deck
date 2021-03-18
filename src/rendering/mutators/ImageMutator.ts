import { SlideMouseEvent } from '@/events/types';
import { resolvePosition } from '@/tools/utilities';
import { ImageMutableSerialized } from '@/types';
import { closestVector, mod } from '@/utilities/utilities';
import V from '@/utilities/Vector';
import { SnapVectorRenderer } from '../helpers';
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
    makeSnapVectors,
    renderBoxHelpers,
    resizeBoxHelpers,
    rotateBoxHelpers,
    scaleBoxHelpers,
    unrenderBoxHelpers,
    updateSnapVectors
} from '../utilities';

class ImageMutator implements IImageMutator {
    public readonly type = GRAPHIC_TYPES.IMAGE;
    public readonly target: IImageRenderer;

    private _helpers: BoundingBoxMutatorHelpers & { snapVectors: SnapVectorRenderer[] };
    private _graphicId: string;
    private _slide: ISlideRenderer;

    constructor({
        target,
        slide,
        scale,
        graphicId
    }: {
        target: IImageRenderer;
        slide: ISlideRenderer;
        scale: number;
        graphicId: string;
    }) {
        this.target = target;
        this._graphicId = graphicId;
        this._slide = slide;

        // Initialize helper graphics
        this._helpers = {
            ...makeBoxHelpers(this.target, this._slide, scale),
            snapVectors: makeSnapVectors(this._slide, scale)
        };

        // Render helper graphics
        renderBoxHelpers(this._helpers);
        this._helpers.snapVectors.forEach(s => s.render());
    }

    public set scale(scale: number) {
        scaleBoxHelpers(this._helpers, scale);
        this._helpers.snapVectors.forEach(s => (s.scale = scale));
    }

    // TODO: Account for ctrl, alt, and snapping
    public vertexListener(role: VERTEX_ROLES): (event: SlideMouseEvent) => ImageMutableSerialized {
        const box = this.target.transformedBox;
        const directions = [
            box.dimensions,
            box.dimensions.signAs(V.northwest),
            box.dimensions.signAs(V.southwest),
            box.dimensions.signAs(V.southeast)
        ].map(direction => direction.rotate(box.rotation));

        // 1. Resolve the slide-relative mouse position
        // 2. Create a vector which represents how to change the respective corner
        // 3. Constrain the vector (to maintain aspect ratio)
        // 4. Unrotate the corner vector to correct for graphic rotation
        // 5. Use the post-shift corner vector and corrected corner vector to update props
        const makeListener = (oppositeCorner: V): (event: SlideMouseEvent) => ImageMutableSerialized => {
            return event => {
                const { baseEvent, slide } = event.detail;
                const position = resolvePosition(baseEvent, slide);
                const rawCornerVector = oppositeCorner.towards(position);
                const cornerVector = rawCornerVector.projectOn(closestVector(rawCornerVector, directions));
                const correctedCornerVector = cornerVector.rotate(-box.rotation);

                const dimensions = correctedCornerVector.abs;
                const center = oppositeCorner.add(cornerVector.scale(0.5));
                const origin = center.add(dimensions.scale(-0.5));

                // Update rendering
                this.target.setOriginAndDimensions(origin, dimensions);
                this._repositionBoxHelpers();

                return { origin: this.target.origin, dimensions: this.target.dimensions };
            };
        };

        return ({
            [VERTEX_ROLES.TOP_LEFT]: makeListener(box.bottomRight),
            [VERTEX_ROLES.TOP_RIGHT]: makeListener(box.bottomLeft),
            [VERTEX_ROLES.BOTTOM_LEFT]: makeListener(box.topRight),
            [VERTEX_ROLES.BOTTOM_RIGHT]: makeListener(box.topLeft)
        })[role];
    }

    public rotateListener(): (event: SlideMouseEvent) => ImageMutableSerialized {
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

    public moveListener(initialPosition: V): (event: SlideMouseEvent) => ImageMutableSerialized {
        const initialOrigin = this.target.origin;
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

            this.target.origin = initialOrigin.add(move);
            this._repositionBoxHelpers();
            updateSnapVectors(newSnapVectors, this._helpers.snapVectors);

            return { origin: this.target.origin };
        };
    }

    public setX(x: number): void {
        this.target.origin = new V(x, this.target.origin.y);
        this._repositionBoxHelpers();
    }

    public setY(y: number): void {
        this.target.origin = new V(this.target.origin.x, y);
        this._repositionBoxHelpers();
    }

    public setWidth(width: number): void {
        // When the width changes, we preserve aspect ratio
        const heightToWidth = this.target.dimensions.y / this.target.dimensions.x;
        this.target.dimensions = new V(width, width * heightToWidth);
        this._repositionBoxHelpers();
    }

    public setHeight(height: number): void {
        // When the height changes, we preserve aspect ratio
        const widthToHeight = this.target.dimensions.x / this.target.dimensions.y;
        this.target.dimensions = new V(height * widthToHeight, height);
        this._repositionBoxHelpers();
    }

    public setRotation(rotation: number): void {
        this.target.rotation = rotation;
        rotateBoxHelpers(this._helpers, this.target.transformedBox);
    }

    public complete(): void {
        // Remove helper graphics
        unrenderBoxHelpers(this._helpers);
        this._helpers.snapVectors.forEach(s => s.unrender());
    }

    private _repositionBoxHelpers(): void {
        resizeBoxHelpers(this._helpers, this.target.transformedBox);
    }
}

export default ImageMutator;
