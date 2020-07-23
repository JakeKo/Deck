import { provideId } from "../../utilities/IdProvider";
import Vector from "../../utilities/Vector";
import { RectangleRenderer } from "../graphics";
import { VertexRenderer } from "../helpers";
import SlideRenderer from "../SlideRenderer";
import { GraphicMaker } from "../types";

type RectangleMakerArgs = {
    slide: SlideRenderer;
    initialPosition: Vector;
    scale: number;
};

type RectangleMakerHelpers = {
    topLeft: VertexRenderer;
    topRight: VertexRenderer;
    bottomLeft: VertexRenderer;
    bottomRight: VertexRenderer;
};

class RectangleMaker implements GraphicMaker {
    private _rectangle: RectangleRenderer;
    private _slide: SlideRenderer;
    private _initialPosition: Vector;
    private _helpers: RectangleMakerHelpers;

    constructor(args: RectangleMakerArgs) {
        this._slide = args.slide;
        this._initialPosition = args.initialPosition;

        // TODO: Aggregate snap vectors here
        // Initialize primary graphic
        this._rectangle = new RectangleRenderer({
            id: provideId(),
            slide: this._slide,
            origin: this._initialPosition
        });

        // Initialize helper graphics
        this._helpers = {
            topLeft: new VertexRenderer({
                slide: this._slide,
                center: this._rectangle.getOrigin(),
                scale: args.scale
            }),
            topRight: new VertexRenderer({
                slide: this._slide,
                center: this._rectangle.getOrigin().add(new Vector(this._rectangle.getWidth(), 0)),
                scale: args.scale
            }),
            bottomLeft: new VertexRenderer({
                slide: this._slide,
                center: this._rectangle.getOrigin().add(new Vector(0, this._rectangle.getHeight())),
                scale: args.scale
            }),
            bottomRight: new VertexRenderer({
                slide: this._slide,
                center: this._rectangle.getOrigin().add(new Vector(this._rectangle.getWidth(), this._rectangle.getHeight())),
                scale: args.scale
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

    public getTarget(): RectangleRenderer {
        return this._rectangle;
    }

    public setScale(scale: number): void {
        this._helpers.topLeft.setScale(scale);
        this._helpers.topRight.setScale(scale);
        this._helpers.bottomLeft.setScale(scale);
        this._helpers.bottomRight.setScale(scale);
    }

    public complete(): void {
        this._slide.setGraphic(this._rectangle);

        // Remove helper graphics
        this._helpers.topLeft.unrender();
        this._helpers.topRight.unrender();
        this._helpers.bottomLeft.unrender();
        this._helpers.bottomRight.unrender();
    }

    public resize(position: Vector, shift: boolean, ctrl: boolean, alt: boolean): void {
        const rawOffset = this._initialPosition.towards(position);
        const absOffset = rawOffset.transform(Math.abs);
        const minOffset = Math.min(absOffset.x, absOffset.y);
        const postShiftOffset = shift ? new Vector(Math.sign(rawOffset.x) * minOffset, Math.sign(rawOffset.y) * minOffset) : rawOffset;

        if (ctrl) {
            const dimensions = postShiftOffset.transform(Math.abs).scale(2);
            const originOffset = postShiftOffset.transform(Math.abs).scale(-1);
            this._rectangle.setOrigin(this._initialPosition.add(originOffset));
            this._rectangle.setWidth(dimensions.x);
            this._rectangle.setHeight(dimensions.y);
        } else {
            const dimensions = postShiftOffset.transform(Math.abs);
            const originOffset = postShiftOffset.scale(0.5).add(dimensions.scale(-0.5));
            this._rectangle.setOrigin(this._initialPosition.add(originOffset));
            this._rectangle.setWidth(dimensions.x);
            this._rectangle.setHeight(dimensions.y);
        }

        // Update helper graphics
        this._helpers.topLeft.setCenter(this._rectangle.getOrigin());
        this._helpers.topRight.setCenter(this._rectangle.getOrigin().add(new Vector(this._rectangle.getWidth(), 0)));
        this._helpers.bottomLeft.setCenter(this._rectangle.getOrigin().add(new Vector(0, this._rectangle.getHeight())));
        this._helpers.bottomRight.setCenter(this._rectangle.getOrigin().add(new Vector(this._rectangle.getWidth(), this._rectangle.getHeight())));
    }
}

export default RectangleMaker;
