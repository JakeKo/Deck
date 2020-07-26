import Vector from "../../utilities/Vector";
import { RectangleRenderer } from "../graphics";
import { VertexRenderer } from "../helpers";
import SlideRenderer from "../SlideRenderer";
import { GraphicMutator, GRAPHIC_TYPES } from "../types";
import { closestVector } from "../../utilities/utilities";

type RectangleMutatorArgs = {
    target: RectangleRenderer;
    slide: SlideRenderer;
    scale: number;
};

type RectangleMutatorHelpers = {
    topLeft: VertexRenderer;
    topRight: VertexRenderer;
    bottomLeft: VertexRenderer;
    bottomRight: VertexRenderer;
};

class RectangleMutator implements GraphicMutator {
    private _target: RectangleRenderer;
    private _slide: SlideRenderer;
    private _helpers: RectangleMutatorHelpers;

    constructor(args: RectangleMutatorArgs) {
        this._target = args.target;
        this._slide = args.slide;

        // Initialize helper graphics
        const corners = this._getCorners();
        this._helpers = {
            topLeft: new VertexRenderer({
                slide: this._slide,
                parent: this.getTarget(),
                center: corners.topLeft,
                scale: args.scale,
                location: 'topLeft'
            }),
            topRight: new VertexRenderer({
                slide: this._slide,
                parent: this.getTarget(),
                center: corners.topRight,
                scale: args.scale,
                location: 'topRight'
            }),
            bottomLeft: new VertexRenderer({
                slide: this._slide,
                parent: this.getTarget(),
                center: corners.bottomLeft,
                scale: args.scale,
                location: 'bottomLeft'
            }),
            bottomRight: new VertexRenderer({
                slide: this._slide,
                parent: this.getTarget(),
                center: corners.bottomRight,
                scale: args.scale,
                location: 'bottomRight'
            })
        };

        // Render helper graphics
        this._helpers.topLeft.render();
        this._helpers.topRight.render();
        this._helpers.bottomLeft.render();
        this._helpers.bottomRight.render();
    }

    public getType(): GRAPHIC_TYPES {
        return GRAPHIC_TYPES.RECTANGLE;
    }

    public getTarget(): RectangleRenderer {
        return this._target;
    }

    // TODO: Account for shift, alt, and snapping
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

    // TODO: Account for shift, alt, and snapping
    public vertexMoveHandlers(): { [index: string]: () => (position: Vector) => void } {
        const makeHandler = (oppositeCorner: Vector): (position: Vector) => void => {
            return position => {
                const offset = oppositeCorner.towards(position);
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
        return {
            'topLeft': () => makeHandler(corners.bottomRight),
            'topRight': () => makeHandler(corners.bottomLeft),
            'bottomLeft': () => makeHandler(corners.topRight),
            'bottomRight': () => makeHandler(corners.topLeft)
        };
    }

    // TODO: Include methods for other mutations

    public complete(): void {
        // Remove helper graphics
        this._helpers.topLeft.unrender();
        this._helpers.topRight.unrender();
        this._helpers.bottomLeft.unrender();
        this._helpers.bottomRight.unrender();
    }

    public setScale(scale: number): void {
        this._helpers.topLeft.setScale(scale);
        this._helpers.topRight.setScale(scale);
        this._helpers.bottomLeft.setScale(scale);
        this._helpers.bottomRight.setScale(scale);
    }

    private _repositionVertices(): void {
        const corners = this._getCorners();
        this._helpers.topLeft.setCenter(corners.topLeft);
        this._helpers.topRight.setCenter(corners.topRight);
        this._helpers.bottomLeft.setCenter(corners.bottomLeft);
        this._helpers.bottomRight.setCenter(corners.bottomRight);
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

export default RectangleMutator;
