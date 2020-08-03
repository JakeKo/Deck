import { SlideMouseEvent } from "../../events/types";
import { resolvePosition } from "../../tools/utilities";
import { closestVector } from "../../utilities/utilities";
import Vector from "../../utilities/Vector";
import { ImageRenderer } from "../graphics";
import SlideRenderer from "../SlideRenderer";
import { BoundingBoxMutatorHelpers, GraphicMutator, GRAPHIC_TYPES, VERTEX_ROLES } from "../types";
import { makeBoxHelpers, renderBoxHelpers, resizeBoxHelpers, scaleBoxHelpers, unrenderBoxHelpers } from "../utilities";

type ImageMutatorArgs = {
    target: ImageRenderer;
    slide: SlideRenderer;
    scale: number;
};

class ImageMutator implements GraphicMutator {
    public target: ImageRenderer;
    public helpers: BoundingBoxMutatorHelpers;

    constructor(args: ImageMutatorArgs) {
        this.target = args.target;

        // Initialize helper graphics
        this.helpers = makeBoxHelpers(this.target, args.slide, args.scale);

        // Render helper graphics
        renderBoxHelpers(this.helpers);
    }

    public getType(): GRAPHIC_TYPES {
        return GRAPHIC_TYPES.IMAGE;
    }

    public getTarget(): ImageRenderer {
        return this.target;
    }

    // TODO: Account for ctrl, alt, and snapping
    public get boxListeners(): { [key in VERTEX_ROLES]: (event: SlideMouseEvent) => void } {
        const size = new Vector(this.target.getWidth(), this.target.getHeight());
        const directions = [size, size.signAs(Vector.northwest), size.signAs(Vector.southwest), size.signAs(Vector.southeast)];

        const makeListener = (oppositeCorner: Vector): (event: SlideMouseEvent) => void => {
            return event => {
                const { baseEvent, slide } = event.detail;
                const position = resolvePosition(baseEvent, slide);
                const rawOffset = oppositeCorner.towards(position);
                const offset = rawOffset.projectOn(closestVector(rawOffset, directions));

                const dimensions = offset.abs;
                const origin = oppositeCorner.add(offset.scale(0.5).add(dimensions.scale(-0.5)));

                // Update rendering
                this.target.setOrigin(origin);
                this.target.setWidth(dimensions.x);
                this.target.setHeight(dimensions.y);
                this._refreshHelpers();
            };
        };

        const corners = this._getCorners();
        return {
            [VERTEX_ROLES.TOP_LEFT]: makeListener(corners.bottomRight),
            [VERTEX_ROLES.TOP_RIGHT]: makeListener(corners.bottomLeft),
            [VERTEX_ROLES.BOTTOM_LEFT]: makeListener(corners.topRight),
            [VERTEX_ROLES.BOTTOM_RIGHT]: makeListener(corners.topLeft)
        };
    }

    // TODO: Account for alt and snapping
    public graphicMoveHandler(): (position: Vector, shift: boolean, alt: boolean) => void {
        const initialOrigin = this.target.getOrigin();
        const directions = [Vector.east, Vector.northeast, Vector.north, Vector.northwest, Vector.west, Vector.southwest, Vector.south, Vector.southeast];

        return (position, shift, alt) => {
            const rawMove = initialOrigin.towards(position);
            const moveDirection = (shift ? closestVector(rawMove, directions) : rawMove).normalized;
            const move = rawMove.projectOn(moveDirection);

            this.target.setOrigin(initialOrigin.add(move));
            this._refreshHelpers();
        };
    }

    // TODO: Include methods for other mutations

    public complete(): void {
        // Remove helper graphics
        unrenderBoxHelpers(this.helpers);
    }

    public setScale(scale: number): void {
        scaleBoxHelpers(this.helpers, scale);
    }

    private _refreshHelpers(): void {
        resizeBoxHelpers(this.helpers, this.target.getBoundingBox());
    }

    private _getCorners(): { topLeft: Vector; topRight: Vector; bottomLeft: Vector; bottomRight: Vector } {
        const origin = this.target.getOrigin();
        const dimensions = new Vector(this.target.getWidth(), this.target.getHeight());

        return {
            topLeft: origin,
            topRight: origin.add(new Vector(dimensions.x, 0)),
            bottomLeft: origin.add(new Vector(0, dimensions.y)),
            bottomRight: origin.add(dimensions)
        };
    }
}

export default ImageMutator;
