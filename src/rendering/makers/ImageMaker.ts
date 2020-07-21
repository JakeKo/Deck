import { provideId } from "../../utilities/IdProvider";
import Vector from "../../utilities/Vector";
import { ImageRenderer } from "../graphics";
import { VertexRenderer } from "../helpers";
import SlideRenderer from "../SlideRenderer";

type ImageMakerArgs = {
    slide: SlideRenderer;
    initialPosition: Vector;
    image: string;
    width: number;
    height: number;
};

type ImageMakerHelpers = {
    topLeft: VertexRenderer,
    topRight: VertexRenderer,
    bottomLeft: VertexRenderer,
    bottomRight: VertexRenderer
};

class ImageMaker {
    private _graphic: ImageRenderer;
    private _slide: SlideRenderer;
    private _initialPosition: Vector;
    private _width: number;
    private _height: number;
    private _helpers: ImageMakerHelpers;

    constructor(args: ImageMakerArgs) {
        this._slide = args.slide;
        this._initialPosition = args.initialPosition;
        this._width = args.width;
        this._height = args.height;

        // Initialize primary graphic
        this._graphic = new ImageRenderer({
            id: provideId(),
            slideRenderer: this._slide,
            origin: this._initialPosition,
            image: args.image,
            width: args.width,
            height: args.height
        });

        // Initialize helper graphics
        this._helpers = {
            topLeft: new VertexRenderer({
                slide: this._slide,
                center: this._graphic.getOrigin()
            }),
            topRight: new VertexRenderer({
                slide: this._slide,
                center: this._graphic.getOrigin().add(new Vector(this._graphic.getWidth(), 0))
            }),
            bottomLeft: new VertexRenderer({
                slide: this._slide,
                center: this._graphic.getOrigin().add(new Vector(0, this._graphic.getHeight()))
            }),
            bottomRight: new VertexRenderer({
                slide: this._slide,
                center: this._graphic.getOrigin().add(new Vector(this._graphic.getWidth(), this._graphic.getHeight()))
            })
        };

        // Render primary graphic
        this._graphic.render();

        // Render helper graphics
        this._helpers.topLeft.render();
        this._helpers.topRight.render();
        this._helpers.bottomLeft.render();
        this._helpers.bottomRight.render();
    }

    public getTarget(): ImageRenderer {
        return this._graphic;
    }

    // Some trig, for your enjoyment
    public resize(position: Vector, shift: boolean, ctrl: boolean, alt: boolean): void {
        const rawOffset = this._initialPosition.towards(position);
        const absOffset = rawOffset.abs;
        const absDimensionOffset = absOffset.theta(Vector.right) <= Math.atan2(this._height, this._width)
            ? new Vector(absOffset.x, absOffset.x * this._height / this._width)
            : new Vector(absOffset.y * this._width / this._height, absOffset.y);
        const dimensionOffset = absDimensionOffset.signAs(rawOffset);

        if (ctrl) {
            const dimensions = dimensionOffset.abs.scale(2);
            const originOffset = dimensionOffset.abs.scale(-1);
            this._graphic.setOrigin(this._initialPosition.add(originOffset));
            this._graphic.setWidth(dimensions.x);
            this._graphic.setHeight(dimensions.y);
        } else {
            const dimensions = dimensionOffset.abs;
            const originOffset = dimensionOffset.scale(0.5).add(dimensions.scale(-0.5));
            this._graphic.setOrigin(this._initialPosition.add(originOffset));
            this._graphic.setWidth(dimensions.x);
            this._graphic.setHeight(dimensions.y);
        }

        // Update helper graphics
        this._helpers.topLeft.setCenter(this._graphic.getOrigin());
        this._helpers.topRight.setCenter(this._graphic.getOrigin().add(new Vector(this._graphic.getWidth(), 0)));
        this._helpers.bottomLeft.setCenter(this._graphic.getOrigin().add(new Vector(0, this._graphic.getHeight())));
        this._helpers.bottomRight.setCenter(this._graphic.getOrigin().add(new Vector(this._graphic.getWidth(), this._graphic.getHeight())));
    }

    public complete(): void {
        this._slide.setGraphic(this._graphic);

        // Remove helper graphics
        this._helpers.topLeft.unrender();
        this._helpers.topRight.unrender();
        this._helpers.bottomLeft.unrender();
        this._helpers.bottomRight.unrender();
    }
}

export default ImageMaker;
