import { provideId } from "../../utilities/IdProvider";
import Vector from "../../utilities/Vector";
import { ImageRenderer } from "../graphics";
import { VertexRenderer } from "../helpers";
import SlideRenderer from "../SlideRenderer";
import { GraphicMaker, VERTEX_ROLES } from "../types";
import { closestVector } from "../../utilities/utilities";

type ImageMakerArgs = {
    slide: SlideRenderer;
    initialPosition: Vector;
    scale: number;
    source: string;
    width: number;
    height: number;
};

type ImageMakerHelpers = { [key in VERTEX_ROLES]: VertexRenderer };

class ImageMaker implements GraphicMaker {
    private _image: ImageRenderer;
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
        this._image = new ImageRenderer({
            id: provideId(),
            slide: this._slide,
            origin: this._initialPosition,
            source: args.source,
            width: args.width,
            height: args.height
        });

        // Initialize helper graphics
        this._helpers = {
            [VERTEX_ROLES.TOP_LEFT]: new VertexRenderer({
                slide: this._slide,
                parent: this.getTarget(),
                center: this._image.getOrigin(),
                scale: args.scale,
                role: VERTEX_ROLES.TOP_LEFT
            }),
            [VERTEX_ROLES.TOP_RIGHT]: new VertexRenderer({
                slide: this._slide,
                parent: this.getTarget(),
                center: this._image.getOrigin().add(new Vector(this._image.getWidth(), 0)),
                scale: args.scale,
                role: VERTEX_ROLES.TOP_RIGHT
            }),
            [VERTEX_ROLES.BOTTOM_LEFT]: new VertexRenderer({
                slide: this._slide,
                parent: this.getTarget(),
                center: this._image.getOrigin().add(new Vector(0, this._image.getHeight())),
                scale: args.scale,
                role: VERTEX_ROLES.BOTTOM_LEFT
            }),
            [VERTEX_ROLES.BOTTOM_RIGHT]: new VertexRenderer({
                slide: this._slide,
                parent: this.getTarget(),
                center: this._image.getOrigin().add(new Vector(this._image.getWidth(), this._image.getHeight())),
                scale: args.scale,
                role: VERTEX_ROLES.BOTTOM_RIGHT
            })
        };

        // Render primary graphic
        this._image.render();

        // Render helper graphics
        this._helpers[VERTEX_ROLES.TOP_LEFT].render();
        this._helpers[VERTEX_ROLES.TOP_RIGHT].render();
        this._helpers[VERTEX_ROLES.BOTTOM_LEFT].render();
        this._helpers[VERTEX_ROLES.BOTTOM_RIGHT].render();
    }

    public getTarget(): ImageRenderer {
        return this._image;
    }

    public setScale(scale: number): void {
        this._helpers[VERTEX_ROLES.TOP_LEFT].setScale(scale);
        this._helpers[VERTEX_ROLES.TOP_RIGHT].setScale(scale);
        this._helpers[VERTEX_ROLES.BOTTOM_LEFT].setScale(scale);
        this._helpers[VERTEX_ROLES.BOTTOM_RIGHT].setScale(scale);
    }

    public complete(): void {
        this._slide.setGraphic(this._image);

        // Remove helper graphics
        this._helpers[VERTEX_ROLES.TOP_LEFT].unrender();
        this._helpers[VERTEX_ROLES.TOP_RIGHT].unrender();
        this._helpers[VERTEX_ROLES.BOTTOM_LEFT].unrender();
        this._helpers[VERTEX_ROLES.BOTTOM_RIGHT].unrender();
    }

    // Some trig, for your enjoyment
    public resize(position: Vector, shift: boolean, ctrl: boolean, alt: boolean): void {
        const size = new Vector(this._width, this._height).normalized;
        const directions = [size, size.signAs(Vector.southeast), size.signAs(Vector.southwest), size.signAs(Vector.northwest)];
        const rawOffset = this._initialPosition.towards(position);
        const offset = rawOffset.projectOn(closestVector(rawOffset, directions));

        if (ctrl) {
            const dimensions = offset.abs.scale(2);
            const originOffset = offset.abs.scale(-1);
            this._image.setOrigin(this._initialPosition.add(originOffset));
            this._image.setWidth(dimensions.x);
            this._image.setHeight(dimensions.y);
        } else {
            const dimensions = offset.abs;
            const originOffset = offset.scale(0.5).add(dimensions.scale(-0.5));
            this._image.setOrigin(this._initialPosition.add(originOffset));
            this._image.setWidth(dimensions.x);
            this._image.setHeight(dimensions.y);
        }

        // Update helper graphics
        this._helpers[VERTEX_ROLES.TOP_LEFT].setCenter(this._image.getOrigin());
        this._helpers[VERTEX_ROLES.TOP_RIGHT].setCenter(this._image.getOrigin().add(new Vector(this._image.getWidth(), 0)));
        this._helpers[VERTEX_ROLES.BOTTOM_LEFT].setCenter(this._image.getOrigin().add(new Vector(0, this._image.getHeight())));
        this._helpers[VERTEX_ROLES.BOTTOM_RIGHT].setCenter(this._image.getOrigin().add(new Vector(this._image.getWidth(), this._image.getHeight())));
    }
}

export default ImageMaker;
