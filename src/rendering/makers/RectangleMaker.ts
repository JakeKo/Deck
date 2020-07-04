import SlideRenderer from "../SlideRenderer";
import Vector from "../../utilities/Vector";
import { RectangleRenderer } from "../graphics";
import { VertexRenderer } from "../helpers";

type RectangleMakerArgs = {
    slide: SlideRenderer;
    initialPosition: Vector;
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
    private _initialPosition: Vector;
    private _helpers: RectangleMakerHelpers;

    constructor(args: RectangleMakerArgs) {
        this._slide = args.slide;
        this._initialPosition = args.initialPosition;

        // TODO: Aggregate snap vectors here
        // TODO: Implement ID provider
        // Initialize primary graphic
        this._rectangle = new RectangleRenderer({
            id: Math.random().toString(),
            slideRenderer: this._slide,
            origin: this._initialPosition
        });

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

        // Render primary graphic
        this._rectangle.render();

        // Render helper graphics
        this._helpers.topLeft.render();
        this._helpers.topRight.render();
        this._helpers.bottomLeft.render();
        this._helpers.bottomRight.render();
    }

    public resize(position: Vector, shift: boolean, ctrl: boolean, alt: boolean): void {
        const rawOffset = this._initialPosition.towards(position);
        const absOffset = rawOffset.transform(Math.abs);
        const minOffset = Math.min(absOffset.x, absOffset.y);
        const postShiftOffset = shift ? new Vector(Math.sign(rawOffset.x) * minOffset, Math.sign(rawOffset.y) * minOffset) : rawOffset;

        if (ctrl) {
            const dimensions = postShiftOffset.transform(Math.abs).scale(2);
            const originOffset = postShiftOffset.transform(Math.abs).scale(-1);
            this._rectangle.origin = this._initialPosition.add(originOffset);
            this._rectangle.width = dimensions.x;
            this._rectangle.height = dimensions.y;
        } else {
            const dimensions = postShiftOffset.transform(Math.abs);
            const originOffset = postShiftOffset.scale(0.5).add(dimensions.scale(-0.5));
            this._rectangle.origin = this._initialPosition.add(originOffset);
            this._rectangle.width = dimensions.x;
            this._rectangle.height = dimensions.y;
        }

        // Update helper graphics
        this._helpers.topLeft.center = this._rectangle.origin;
        this._helpers.topRight.center = this._rectangle.origin.add(new Vector(this._rectangle.width, 0));
        this._helpers.bottomLeft.center = this._rectangle.origin.add(new Vector(0, this._rectangle.height));
        this._helpers.bottomRight.center = this._rectangle.origin.add(new Vector(this._rectangle.width, this._rectangle.height));
    }

    public complete(): void {
        this._slide.persistGraphic(this._rectangle);

        // Remove helper graphics
        this._helpers.topLeft.unrender();
        this._helpers.topRight.unrender();
        this._helpers.bottomLeft.unrender();
        this._helpers.bottomRight.unrender();
    }
}

export default RectangleMaker;
