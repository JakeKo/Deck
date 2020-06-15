import SlideRenderer from "../SlideRenderer";
import RectangleRenderer from "../graphics/RectangleRenderer";
import Vector from "../../models/Vector";
import VertexRenderer from "../helpers/VertexRenderer";

type RectangleMakerArgs = {
    rectangle: RectangleRenderer;
    slide: SlideRenderer;
};

type RectangleMakerHelpers = {
    topLeft: VertexRenderer,
    topRight: VertexRenderer,
    bottomLeft: VertexRenderer,
    bottomRight: VertexRenderer
};

class RectangleMaker {
    private _rectangle: RectangleRenderer;
    private _slide: SlideRenderer;
    private _helpers: RectangleMakerHelpers;

    constructor(args: RectangleMakerArgs) {
        this._rectangle = args.rectangle;
        this._slide = args.slide;

        // Initialize helper graphics
        this._helpers = {
            topLeft: new VertexRenderer({
                canvas: this._slide.canvas,
                center: this._rectangle.origin
            }),
            topRight: new VertexRenderer({
                canvas: this._slide.canvas,
                center: this._rectangle.origin.add(new Vector(this._rectangle.width, 0))
            }),
            bottomLeft: new VertexRenderer({
                canvas: this._slide.canvas,
                center: this._rectangle.origin.add(new Vector(0, this._rectangle.height))
            }),
            bottomRight: new VertexRenderer({
                canvas: this._slide.canvas,
                center: this._rectangle.origin.add(new Vector(this._rectangle.width, this._rectangle.height))
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
        this._rectangle.origin = origin;

        // Update helper graphics
        this._helpers.topLeft.center = this._rectangle.origin;
        this._helpers.topRight.center = this._rectangle.origin.add(new Vector(this._rectangle.width, 0));
        this._helpers.bottomLeft.center = this._rectangle.origin.add(new Vector(0, this._rectangle.height));
        this._helpers.bottomRight.center = this._rectangle.origin.add(new Vector(this._rectangle.width, this._rectangle.height));
    }

    public setDimensions(dimensions: Vector): void {
        // Update rendering
        this._rectangle.width = dimensions.x;
        this._rectangle.height = dimensions.y;

        // Update helper graphics
        this._helpers.topRight.center = this._rectangle.origin.add(new Vector(this._rectangle.width, 0));
        this._helpers.bottomLeft.center = this._rectangle.origin.add(new Vector(0, this._rectangle.height));
        this._helpers.bottomRight.center = this._rectangle.origin.add(new Vector(this._rectangle.width, this._rectangle.height));
    }

    public complete(): void {
        // Remove helper graphics
        this._helpers.topLeft.unrender();
        this._helpers.topRight.unrender();
        this._helpers.bottomLeft.unrender();
        this._helpers.bottomRight.unrender();
    }
}

export default RectangleMaker;
