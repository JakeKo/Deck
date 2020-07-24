import Vector from "../../utilities/Vector";
import { EllipseRenderer } from "../graphics";
import { VertexRenderer } from "../helpers";
import SlideRenderer from "../SlideRenderer";
import { GraphicMutator, GRAPHIC_TYPES } from "../types";

type EllipseMutatorArgs = {
    target: EllipseRenderer;
    slide: SlideRenderer;
    scale: number;
};

type EllipseMutatorHelpers = {
    topLeft: VertexRenderer;
    topRight: VertexRenderer;
    bottomLeft: VertexRenderer;
    bottomRight: VertexRenderer;
};

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
        return GRAPHIC_TYPES.ELLIPSE;
    }

    public getTarget(): EllipseRenderer {
        return this._target;
    }

    // TODO: Account for shift, alt, and snapping
    public move(center: Vector): void {
        // Update rendering
        this._target.setCenter(center);
        this._repositionVertices();
    }

    // TODO: Account for shift, alt, and snapping
    public getVertexHandlers(): { [index: string]: () => (position: Vector) => void } {
        const makeHandler = (oppositeCorner: Vector): (position: Vector) => void => {
            return position => {
                const offset = oppositeCorner.towards(position);
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
        const center = this._target.getCenter();
        const radius = new Vector(this._target.getWidth(), this._target.getHeight()).scale(0.5);

        return {
            topLeft: center.add(radius.signAs(new Vector(-1, -1))),
            topRight: center.add(radius.signAs(new Vector(1, -1))),
            bottomLeft: center.add(radius.signAs(new Vector(-1, 1))),
            bottomRight: center.add(radius.signAs(new Vector(1, 1)))
        };
    }
}

export default EllipseMutator;
