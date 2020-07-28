import { closestVector } from "../../utilities/utilities";
import Vector from "../../utilities/Vector";
import { EllipseRenderer } from "../graphics";
import { VertexRenderer } from "../helpers";
import SlideRenderer from "../SlideRenderer";
import { GraphicMutator, GRAPHIC_TYPES, VERTEX_ROLES } from "../types";

type EllipseMutatorArgs = {
    target: EllipseRenderer;
    slide: SlideRenderer;
    scale: number;
};

type EllipseMutatorHelpers = { [key in VERTEX_ROLES]: VertexRenderer };

class EllipseMutator implements GraphicMutator {
    private _target: EllipseRenderer;
    private _slide: SlideRenderer;
    private _helpers: EllipseMutatorHelpers;

    constructor(args: EllipseMutatorArgs) {
        this._target = args.target;
        this._slide = args.slide;

        // Initialize helper graphics
        const corners = this._getCorners();
        this._helpers = {
            [VERTEX_ROLES.TOP_LEFT]: new VertexRenderer({
                slide: this._slide,
                parent: this.getTarget(),
                center: corners.topLeft,
                scale: args.scale,
                role: VERTEX_ROLES.TOP_LEFT
            }),
            [VERTEX_ROLES.TOP_RIGHT]: new VertexRenderer({
                slide: this._slide,
                parent: this.getTarget(),
                center: corners.topRight,
                scale: args.scale,
                role: VERTEX_ROLES.TOP_RIGHT
            }),
            [VERTEX_ROLES.BOTTOM_LEFT]: new VertexRenderer({
                slide: this._slide,
                parent: this.getTarget(),
                center: corners.bottomLeft,
                scale: args.scale,
                role: VERTEX_ROLES.BOTTOM_LEFT
            }),
            [VERTEX_ROLES.BOTTOM_RIGHT]: new VertexRenderer({
                slide: this._slide,
                parent: this.getTarget(),
                center: corners.bottomRight,
                scale: args.scale,
                role: VERTEX_ROLES.BOTTOM_RIGHT
            })
        };

        // Render helper graphics
        this._helpers[VERTEX_ROLES.TOP_LEFT].render();
        this._helpers[VERTEX_ROLES.TOP_RIGHT].render();
        this._helpers[VERTEX_ROLES.BOTTOM_LEFT].render();
        this._helpers[VERTEX_ROLES.BOTTOM_RIGHT].render();
    }

    public getType(): GRAPHIC_TYPES {
        return GRAPHIC_TYPES.ELLIPSE;
    }

    public getTarget(): EllipseRenderer {
        return this._target;
    }

    // TODO: Account for alt snapping
    public graphicMoveHandler(): (position: Vector, shift: boolean, alt: boolean) => void {
        const initialCenter = this._target.getCenter();
        const directions = [Vector.east, Vector.northeast, Vector.north, Vector.northwest, Vector.west, Vector.southwest, Vector.south, Vector.southeast];

        return (position, shift, alt) => {
            const rawMove = initialCenter.towards(position);
            const moveDirection = (shift ? closestVector(rawMove, directions) : rawMove).normalized;
            const move = rawMove.projectOn(moveDirection);

            this._target.setCenter(initialCenter.add(move));
            this._repositionVertices();
        };
    }

    // TODO: Account for ctrl, alt, and snapping
    public getVertexHandler(role: VERTEX_ROLES): (position: Vector, shift: boolean) => void {
        const size = new Vector(this._target.getWidth(), this._target.getHeight());
        const directions = [ size, size.signAs(Vector.northwest), size.signAs(Vector.southwest), size.signAs(Vector.southeast)];

        const makeHandler = (oppositeCorner: Vector): (position: Vector, shift: boolean) => void => {
            return (position, shift) => {
                const rawOffset = oppositeCorner.towards(position);
                const offset = shift ? rawOffset.projectOn(closestVector(rawOffset, directions)) : rawOffset;

                const dimensions = offset.abs;
                const center = oppositeCorner.add(offset.scale(0.5));

                // Update rendering
                this._target.setCenter(center);
                this._target.setWidth(dimensions.x);
                this._target.setHeight(dimensions.y);
                this._repositionVertices();
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
        this._helpers[VERTEX_ROLES.TOP_LEFT].unrender();
        this._helpers[VERTEX_ROLES.TOP_RIGHT].unrender();
        this._helpers[VERTEX_ROLES.BOTTOM_LEFT].unrender();
        this._helpers[VERTEX_ROLES.BOTTOM_RIGHT].unrender();
    }

    public setScale(scale: number): void {
        this._helpers[VERTEX_ROLES.TOP_LEFT].setScale(scale);
        this._helpers[VERTEX_ROLES.TOP_RIGHT].setScale(scale);
        this._helpers[VERTEX_ROLES.BOTTOM_LEFT].setScale(scale);
        this._helpers[VERTEX_ROLES.BOTTOM_RIGHT].setScale(scale);
    }

    private _repositionVertices(): void {
        const corners = this._getCorners();
        this._helpers[VERTEX_ROLES.TOP_LEFT].setCenter(corners.topLeft);
        this._helpers[VERTEX_ROLES.TOP_RIGHT].setCenter(corners.topRight);
        this._helpers[VERTEX_ROLES.BOTTOM_LEFT].setCenter(corners.bottomLeft);
        this._helpers[VERTEX_ROLES.BOTTOM_RIGHT].setCenter(corners.bottomRight);
    }

    private _getCorners(): { topLeft: Vector; topRight: Vector; bottomLeft: Vector; bottomRight: Vector } {
        const center = this._target.getCenter();
        const radius = new Vector(this._target.getWidth(), this._target.getHeight()).scale(0.5);

        return {
            topLeft: center.add(radius.signAs(Vector.southwest)),
            topRight: center.add(radius.signAs(Vector.southeast)),
            bottomLeft: center.add(radius.signAs(Vector.northwest)),
            bottomRight: center.add(radius.signAs(Vector.northeast))
        };
    }
}

export default EllipseMutator;
