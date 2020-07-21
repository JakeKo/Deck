import { provideId } from "../../utilities/IdProvider";
import Vector from "../../utilities/Vector";
import { EllipseRenderer } from "../graphics";
import { VertexRenderer } from "../helpers";
import SlideRenderer from "../SlideRenderer";

type EllipseMakerArgs = {
    slide: SlideRenderer;
    initialPosition: Vector;
};

type EllipseMakerHelpers = {
    topLeft: VertexRenderer,
    topRight: VertexRenderer,
    bottomLeft: VertexRenderer,
    bottomRight: VertexRenderer
};

class EllipseMaker {
    private _ellipse: EllipseRenderer;
    private _slide: SlideRenderer;
    private _initialPosition: Vector;
    private _helpers: EllipseMakerHelpers;

    constructor(args: EllipseMakerArgs) {
        this._slide = args.slide;
        this._initialPosition = args.initialPosition;

        // TODO: Aggregate snap vectors here
        // Initialize primary graphic
        this._ellipse = new EllipseRenderer({
            id: provideId(),
            slide: this._slide,
            origin: this._initialPosition
        });

        // Initialize helper graphics
        this._helpers = {
            topLeft: new VertexRenderer({
                slide: this._slide,
                center: this._ellipse.getOrigin()
            }),
            topRight: new VertexRenderer({
                slide: this._slide,
                center: this._ellipse.getOrigin().add(new Vector(this._ellipse.getWidth(), 0))
            }),
            bottomLeft: new VertexRenderer({
                slide: this._slide,
                center: this._ellipse.getOrigin().add(new Vector(0, this._ellipse.getHeight()))
            }),
            bottomRight: new VertexRenderer({
                slide: this._slide,
                center: this._ellipse.getOrigin().add(new Vector(this._ellipse.getWidth(), this._ellipse.getHeight()))
            })
        };

        // Render primary graphic
        this._ellipse.render();

        // Render helper graphics
        this._helpers.topLeft.render();
        this._helpers.topRight.render();
        this._helpers.bottomLeft.render();
        this._helpers.bottomRight.render();
    }

    public getTarget(): EllipseRenderer {
        return this._ellipse;
    }

    public resize(position: Vector, shift: boolean, ctrl: boolean, alt: boolean): void {
        const rawOffset = this._initialPosition.towards(position);
        const absOffset = rawOffset.transform(Math.abs);
        const minOffset = Math.min(absOffset.x, absOffset.y);
        const postShiftOffset = shift ? new Vector(Math.sign(rawOffset.x) * minOffset, Math.sign(rawOffset.y) * minOffset) : rawOffset;

        if (ctrl) {
            const dimensions = postShiftOffset.transform(Math.abs).scale(2);
            const originOffset = postShiftOffset.transform(Math.abs).scale(-1);
            this._ellipse.setOrigin(this._initialPosition.add(originOffset));
            this._ellipse.setWidth(dimensions.x);
            this._ellipse.setHeight(dimensions.y);
        } else {
            const dimensions = postShiftOffset.transform(Math.abs);
            const originOffset = postShiftOffset.scale(0.5).add(dimensions.scale(-0.5));
            this._ellipse.setOrigin(this._initialPosition.add(originOffset));
            this._ellipse.setWidth(dimensions.x);
            this._ellipse.setHeight(dimensions.y);
        }

        // Update helper graphics
        this._helpers.topLeft.setCenter(this._ellipse.getOrigin());
        this._helpers.topRight.setCenter(this._ellipse.getOrigin().add(new Vector(this._ellipse.getWidth(), 0)));
        this._helpers.bottomLeft.setCenter(this._ellipse.getOrigin().add(new Vector(0, this._ellipse.getHeight())));
        this._helpers.bottomRight.setCenter(this._ellipse.getOrigin().add(new Vector(this._ellipse.getWidth(), this._ellipse.getHeight())));
    }

    public complete(): void {
        this._slide.setGraphic(this._ellipse);

        // Remove helper graphics
        this._helpers.topLeft.unrender();
        this._helpers.topRight.unrender();
        this._helpers.bottomLeft.unrender();
        this._helpers.bottomRight.unrender();
    }
}

export default EllipseMaker;
