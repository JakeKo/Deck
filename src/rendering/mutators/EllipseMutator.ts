import { closestVector } from "../../utilities/utilities";
import Vector from "../../utilities/Vector";
import { EllipseRenderer } from "../graphics";
import SlideRenderer from "../SlideRenderer";
import { BoundingBoxMutatorHelpers, GraphicMutator, GRAPHIC_TYPES, VERTEX_ROLES } from "../types";
import { makeBoxHelpers, renderBoxHelpers, resizeBoxHelpers, scaleBoxHelpers, unrenderBoxHelpers } from "../utilities";

type EllipseMutatorArgs = {
    target: EllipseRenderer;
    slide: SlideRenderer;
    scale: number;
};

class EllipseMutator implements GraphicMutator {
    public target: EllipseRenderer;
    public helpers: BoundingBoxMutatorHelpers;

    constructor(args: EllipseMutatorArgs) {
        this.target = args.target;

        // Initialize helper graphics
        this.helpers = makeBoxHelpers(this.target, args.slide, args.scale);

        // Render helper graphics
        renderBoxHelpers(this.helpers);
    }

    public getType(): GRAPHIC_TYPES {
        return GRAPHIC_TYPES.ELLIPSE;
    }

    public getTarget(): EllipseRenderer {
        return this.target;
    }

    // TODO: Account for alt snapping
    public graphicMoveHandler(): (position: Vector, shift: boolean, alt: boolean) => void {
        const initialCenter = this.target.getCenter();
        const directions = [Vector.east, Vector.northeast, Vector.north, Vector.northwest, Vector.west, Vector.southwest, Vector.south, Vector.southeast];

        return (position, shift, alt) => {
            const rawMove = initialCenter.towards(position);
            const moveDirection = (shift ? closestVector(rawMove, directions) : rawMove).normalized;
            const move = rawMove.projectOn(moveDirection);

            this.target.setCenter(initialCenter.add(move));
            this._refreshHelpers();
        };
    }

    // TODO: Account for ctrl, alt, and snapping
    public getVertexHandler(role: VERTEX_ROLES): (position: Vector, shift: boolean) => void {
        const size = new Vector(this.target.getWidth(), this.target.getHeight());
        const directions = [ size, size.signAs(Vector.northwest), size.signAs(Vector.southwest), size.signAs(Vector.southeast)];

        const makeHandler = (oppositeCorner: Vector): (position: Vector, shift: boolean) => void => {
            return (position, shift) => {
                const rawOffset = oppositeCorner.towards(position);
                const offset = shift ? rawOffset.projectOn(closestVector(rawOffset, directions)) : rawOffset;

                const dimensions = offset.abs;
                const center = oppositeCorner.add(offset.scale(0.5));

                // Update rendering
                this.target.setCenter(center);
                this.target.setWidth(dimensions.x);
                this.target.setHeight(dimensions.y);
                this._refreshHelpers();
            };
        };

        const corners = this._getCorners();
        return ({
            [VERTEX_ROLES.TOP_LEFT]: makeHandler(corners.bottomRight),
            [VERTEX_ROLES.TOP_RIGHT]: makeHandler(corners.bottomLeft),
            [VERTEX_ROLES.BOTTOM_LEFT]: makeHandler(corners.topRight),
            [VERTEX_ROLES.BOTTOM_RIGHT]: makeHandler(corners.topLeft)
        } as { [key in VERTEX_ROLES]: (position: Vector, shift: boolean) => void })[role];
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
        const center = this.target.getCenter();
        const radius = new Vector(this.target.getWidth(), this.target.getHeight()).scale(0.5);

        return {
            topLeft: center.add(radius.signAs(Vector.southwest)),
            topRight: center.add(radius.signAs(Vector.southeast)),
            bottomLeft: center.add(radius.signAs(Vector.northwest)),
            bottomRight: center.add(radius.signAs(Vector.northeast))
        };
    }
}

export default EllipseMutator;
