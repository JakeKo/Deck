import Vector from "../../utilities/Vector";
import { RectangleRenderer } from "../graphics";
import { VertexRenderer } from "../helpers";
import SlideRenderer from "../SlideRenderer";

type RectangleMutatorArgs = {
    rectangle: RectangleRenderer;
    slide: SlideRenderer;
};

type RectangleMutatorHelpers = {
    topLeft: VertexRenderer,
    topRight: VertexRenderer,
    bottomLeft: VertexRenderer,
    bottomRight: VertexRenderer
};

class RectangleMutator {
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
                center: this._rectangle.getOrigin()
            }),
            topRight: new VertexRenderer({
                slide: this._slide,
                center: this._rectangle.getOrigin().add(new Vector(this._rectangle.getWidth(), 0))
            }),
            bottomLeft: new VertexRenderer({
                slide: this._slide,
                center: this._rectangle.getOrigin().add(new Vector(0, this._rectangle.getHeight()))
            }),
            bottomRight: new VertexRenderer({
                slide: this._slide,
                center: this._rectangle.getOrigin().add(new Vector(this._rectangle.getWidth(), this._rectangle.getHeight()))
            })
        };

        // Render helper graphics
        this._helpers.topLeft.render();
        this._helpers.topRight.render();
        this._helpers.bottomLeft.render();
        this._helpers.bottomRight.render();
    }

    public move(origin: Vector): void {
        // Update rendering
        this._rectangle.setOrigin(origin);

        // Update helper graphics
        this._helpers.topLeft.setCenter(this._rectangle.getOrigin());
        this._helpers.topRight.setCenter(this._rectangle.getOrigin().add(new Vector(this._rectangle.getWidth(), 0)));
        this._helpers.bottomLeft.setCenter(this._rectangle.getOrigin().add(new Vector(0, this._rectangle.getHeight())));
        this._helpers.bottomRight.setCenter(this._rectangle.getOrigin().add(new Vector(this._rectangle.getWidth(), this._rectangle.getHeight())));
    }

    public setDimensions(dimensions: Vector): void {
        // Update rendering
        this._rectangle.setWidth(dimensions.x);
        this._rectangle.setHeight(dimensions.y);

        // Update helper graphics
        this._helpers.topRight.setCenter(this._rectangle.getOrigin().add(new Vector(this._rectangle.getWidth(), 0)));
        this._helpers.bottomLeft.setCenter(this._rectangle.getOrigin().add(new Vector(0, this._rectangle.getHeight())));
        this._helpers.bottomRight.setCenter(this._rectangle.getOrigin().add(new Vector(this._rectangle.getWidth(), this._rectangle.getHeight())));
    }

    // TODO: Include methods for other mutations

    public complete(): void {
        // Remove helper graphics
        this._helpers.topLeft.unrender();
        this._helpers.topRight.unrender();
        this._helpers.bottomLeft.unrender();
        this._helpers.bottomRight.unrender();
    }
}

export default RectangleMutator;
