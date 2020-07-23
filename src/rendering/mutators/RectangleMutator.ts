import Vector from "../../utilities/Vector";
import { RectangleRenderer } from "../graphics";
import { VertexRenderer } from "../helpers";
import SlideRenderer from "../SlideRenderer";
import { GraphicMutator, GRAPHIC_TYPES } from "../types";

type RectangleMutatorArgs = {
    rectangle: RectangleRenderer;
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
    private _rectangle: RectangleRenderer;
    private _slide: SlideRenderer;
    private _helpers: RectangleMutatorHelpers;

    constructor(args: RectangleMutatorArgs) {
        this._rectangle = args.rectangle;
        this._slide = args.slide;

        // Initialize helper graphics
        this._helpers = {
            topLeft: new VertexRenderer({
                slide: this._slide,
                parent: this.getTarget(),
                center: this._rectangle.getOrigin(),
                scale: args.scale,
                location: 'topLeft'
            }),
            topRight: new VertexRenderer({
                slide: this._slide,
                parent: this.getTarget(),
                center: this._rectangle.getOrigin().add(new Vector(this._rectangle.getWidth(), 0)),
                scale: args.scale,
                location: 'topRight'
            }),
            bottomLeft: new VertexRenderer({
                slide: this._slide,
                parent: this.getTarget(),
                center: this._rectangle.getOrigin().add(new Vector(0, this._rectangle.getHeight())),
                scale: args.scale,
                location: 'bottomLeft'
            }),
            bottomRight: new VertexRenderer({
                slide: this._slide,
                parent: this.getTarget(),
                center: this._rectangle.getOrigin().add(new Vector(this._rectangle.getWidth(), this._rectangle.getHeight())),
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
        return this._rectangle;
    }

    // TODO: Account for shift, alt, and snapping
    public move(origin: Vector): void {
        // Update rendering
        this._rectangle.setOrigin(origin);

        // Update helper graphics
        this._helpers.topLeft.setCenter(this._rectangle.getOrigin());
        this._helpers.topRight.setCenter(this._rectangle.getOrigin().add(new Vector(this._rectangle.getWidth(), 0)));
        this._helpers.bottomLeft.setCenter(this._rectangle.getOrigin().add(new Vector(0, this._rectangle.getHeight())));
        this._helpers.bottomRight.setCenter(this._rectangle.getOrigin().add(new Vector(this._rectangle.getWidth(), this._rectangle.getHeight())));
    }

    // TODO: Account for shift, alt, ctrl, and snapping
    public setDimensions(dimensions: Vector): void {
        // Update rendering
        this._rectangle.setWidth(dimensions.x);
        this._rectangle.setHeight(dimensions.y);

        // Update helper graphics
        this._helpers.topRight.setCenter(this._rectangle.getOrigin().add(new Vector(this._rectangle.getWidth(), 0)));
        this._helpers.bottomLeft.setCenter(this._rectangle.getOrigin().add(new Vector(0, this._rectangle.getHeight())));
        this._helpers.bottomRight.setCenter(this._rectangle.getOrigin().add(new Vector(this._rectangle.getWidth(), this._rectangle.getHeight())));
    }

    // TODO: Account for shift, alt, and snapping
    public getVertexHandlers(): { [index: string]: () => (position: Vector) => void } {
        const makeHandler = (oppositeCorner: Vector): (position: Vector) => void => {
            return position => {
                const offset = oppositeCorner.towards(position);
                const dimensions = offset.abs;
                const origin = oppositeCorner.add(offset.scale(0.5).add(dimensions.scale(-0.5)));

                // Update rendering
                this._rectangle.setOrigin(origin);
                this._rectangle.setWidth(dimensions.x);
                this._rectangle.setHeight(dimensions.y);

                // Update helper graphics
                this._helpers.topLeft.setCenter(origin);
                this._helpers.topRight.setCenter(origin.add(new Vector(dimensions.x, 0)));
                this._helpers.bottomLeft.setCenter(origin.add(new Vector(0, dimensions.y)));
                this._helpers.bottomRight.setCenter(origin.add(dimensions));
            };
        };

        return {
            'topLeft': () => {
                const oppositeCorner = this._rectangle.getOrigin().add(new Vector(this._rectangle.getWidth(), this._rectangle.getHeight()));
                return makeHandler(oppositeCorner);
            },
            'topRight': () => {
                const oppositeCorner = this._rectangle.getOrigin().add(new Vector(0, this._rectangle.getHeight()));
                return makeHandler(oppositeCorner);
            },
            'bottomLeft': () => {
                const oppositeCorner = this._rectangle.getOrigin().add(new Vector(this._rectangle.getWidth(), 0));
                return makeHandler(oppositeCorner);
            },
            'bottomRight': () => {
                const oppositeCorner = this._rectangle.getOrigin();
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

export default RectangleMutator;
