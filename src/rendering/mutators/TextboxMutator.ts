import { closestVector } from "../../utilities/utilities";
import Vector from "../../utilities/Vector";
import { TextboxRenderer } from "../graphics";
import { VertexRenderer } from "../helpers";
import SlideRenderer from "../SlideRenderer";
import { GraphicMutator, GRAPHIC_TYPES, VERTEX_ROLES } from "../types";

type TextboxMutatorArgs = {
    target: TextboxRenderer;
    slide: SlideRenderer;
    scale: number;
};

type TextboxMutatorHelpers = { [key in VERTEX_ROLES]: VertexRenderer };

class TextboxMutator implements GraphicMutator {
    private _target: TextboxRenderer;
    private _slide: SlideRenderer;
    private _helpers: TextboxMutatorHelpers;

    constructor(args: TextboxMutatorArgs) {
        this._target = args.target;
        this._slide = args.slide;

        // Initialize helper targets
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

        // Render helper targets
        this._helpers[VERTEX_ROLES.TOP_LEFT].render();
        this._helpers[VERTEX_ROLES.TOP_RIGHT].render();
        this._helpers[VERTEX_ROLES.BOTTOM_LEFT].render();
        this._helpers[VERTEX_ROLES.BOTTOM_RIGHT].render();
    }

    public getType(): GRAPHIC_TYPES {
        return GRAPHIC_TYPES.TEXTBOX;
    }

    public getTarget(): TextboxRenderer {
        return this._target;
    }

    // TODO: Account for alt and snapping
    public graphicMoveHandler(): (position: Vector, shift: boolean, alt: boolean) => void {
        const initialOrigin = this._target.getOrigin();
        const directions = [Vector.right, new Vector(1, 1), Vector.up, new Vector(-1, 1), Vector.left, new Vector(-1, -1), Vector.down, new Vector(1, -1)];

        return (position, shift, alt) => {
            const rawMove = initialOrigin.towards(position);
            const moveDirection = (shift ? closestVector(rawMove, directions) : rawMove).normalized;
            const move = rawMove.projectOn(moveDirection);

            this._target.setOrigin(initialOrigin.add(move));
            this._repositionVertices();
        };
    }

    // TODO: Account for ctrl, alt, and snapping
    public getVertexHandler(role: VERTEX_ROLES): (position: Vector, shift: boolean) => void {
        const size = new Vector(this._target.getWidth(), this._target.getHeight());
        const directions = [ size, size.signAs(new Vector(-1, 1)), size.signAs(new Vector(-1, -1)), size.signAs(new Vector(1, -1))];

        const makeHandler = (oppositeCorner: Vector): (position: Vector, shift: boolean) => void => {
            return (position, shift) => {
                const rawOffset = oppositeCorner.towards(position);
                const offset = shift ? rawOffset.projectOn(closestVector(rawOffset, directions)) : rawOffset;

                const dimensions = offset.abs;
                const origin = oppositeCorner.add(offset.scale(0.5).add(dimensions.scale(-0.5)));

                // Update rendering
                this._target.setOrigin(origin);
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
        // Remove helper targets
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
        const origin = this._target.getOrigin();
        const dimensions = new Vector(this._target.getWidth(), this._target.getHeight());

        return {
            topLeft: origin,
            topRight: origin.add(new Vector(dimensions.x, 0)),
            bottomLeft: origin.add(new Vector(0, dimensions.y)),
            bottomRight: origin.add(dimensions)
        };
    }
}

export default TextboxMutator;
