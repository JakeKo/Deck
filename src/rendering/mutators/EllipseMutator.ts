import Vector from "../../utilities/Vector";
import { EllipseRenderer } from "../graphics";
import { VertexRenderer } from "../helpers";
import SlideRenderer from "../SlideRenderer";
import { GraphicMutator, GRAPHIC_TYPES } from "../types";

type EllipseMutatorArgs = {
    ellipse: EllipseRenderer;
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
    private _ellipse: EllipseRenderer;
    private _slide: SlideRenderer;
    private _helpers: EllipseMutatorHelpers;

    constructor(args: EllipseMutatorArgs) {
        this._ellipse = args.ellipse;
        this._slide = args.slide;

        // Initialize helper graphics
        const center = this._ellipse.getCenter();
        const radius = new Vector(this._ellipse.getWidth(), this._ellipse.getHeight()).scale(0.5);
        this._helpers = {
            topLeft: new VertexRenderer({
                slide: this._slide,
                parent: this.getTarget(),
                center: center.add(radius.scale(-1)),
                scale: args.scale,
                location: 'topLeft'
            }),
            topRight: new VertexRenderer({
                slide: this._slide,
                parent: this.getTarget(),
                center: center.add(radius.signAs(new Vector(1, -1))),
                scale: args.scale,
                location: 'topRight'
            }),
            bottomLeft: new VertexRenderer({
                slide: this._slide,
                parent: this.getTarget(),
                center: center.add(radius),
                scale: args.scale,
                location: 'bottomLeft'
            }),
            bottomRight: new VertexRenderer({
                slide: this._slide,
                parent: this.getTarget(),
                center: center.add(radius.signAs(new Vector(-1, 1))),
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
        return this._ellipse;
    }

    // TODO: Account for shift, alt, and snapping
    public move(center: Vector): void {
        // Update rendering
        this._ellipse.setCenter(center);

        // Update helper graphics
        const radius = new Vector(this._ellipse.getWidth(), this._ellipse.getHeight()).scale(0.5);
        this._helpers.topLeft.setCenter(center.add(radius.scale(-1)));
        this._helpers.topRight.setCenter(center.add(radius.signAs(new Vector(1, -1))));
        this._helpers.bottomLeft.setCenter(center.add(radius));
        this._helpers.bottomRight.setCenter(center.add(radius.signAs(new Vector(-1, 1))));
    }

    // TODO: Account for shift, alt, ctrl, and snipping
    public setDimensions(dimensions: Vector): void {
        // Update rendering
        this._ellipse.setWidth(dimensions.x);
        this._ellipse.setHeight(dimensions.y);

        // Update helper graphics
        const center = this._ellipse.getCenter();
        const radius = new Vector(this._ellipse.getWidth(), this._ellipse.getHeight()).scale(0.5);
        this._helpers.topRight.setCenter(center.add(radius.signAs(new Vector(1, -1))));
        this._helpers.bottomLeft.setCenter(center.add(radius));
        this._helpers.bottomRight.setCenter(center.add(radius.signAs(new Vector(-1, 1))));
    }

    // TODO: Account for shift, alt, and snapping
    public getVertexHandlers(): { [index: string]: () => (position: Vector) => void } {
        const makeHandler = (oppositeCorner: Vector): (position: Vector) => void => {
            return position => {
                const offset = oppositeCorner.towards(position);
                const dimensions = offset.abs;
                const center = oppositeCorner.add(offset.scale(0.5));

                // Update rendering
                this._ellipse.setCenter(center);
                this._ellipse.setWidth(dimensions.x);
                this._ellipse.setHeight(dimensions.y);

                // Update helper graphics
                const radius = dimensions.scale(0.5);
                this._helpers.topLeft.setCenter(center.add(radius.scale(-1)));
                this._helpers.topRight.setCenter(center.add(radius.signAs(new Vector(1, -1))));
                this._helpers.bottomLeft.setCenter(center.add(radius.signAs(new Vector(-1, 1))));
                this._helpers.bottomRight.setCenter(center.add(radius));
            };
        };

        const center = this._ellipse.getCenter();
        const radius = new Vector(this._ellipse.getWidth(), this._ellipse.getHeight()).scale(0.5);
        return {
            'topLeft': () => {
                const oppositeCorner = center.add(radius);
                return makeHandler(oppositeCorner);
            },
            'topRight': () => {
                const oppositeCorner = center.add(radius.signAs(new Vector(-1, 1)));
                return makeHandler(oppositeCorner);
            },
            'bottomLeft': () => {
                const oppositeCorner = center.add(radius.signAs(new Vector(1, -1)));
                return makeHandler(oppositeCorner);
            },
            'bottomRight': () => {
                const oppositeCorner = center.add(radius.signAs(new Vector(-1, -1)));
                return makeHandler(oppositeCorner);
            }
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
}

export default EllipseMutator;
