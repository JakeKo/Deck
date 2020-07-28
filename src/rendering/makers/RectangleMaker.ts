import { provideId } from "../../utilities/IdProvider";
import Vector from "../../utilities/Vector";
import { RectangleRenderer } from "../graphics";
import { VertexRenderer } from "../helpers";
import SlideRenderer from "../SlideRenderer";
import { GraphicMaker, VERTEX_ROLES } from "../types";
import { closestVector } from "../../utilities/utilities";

type RectangleMakerArgs = {
    slide: SlideRenderer;
    initialPosition: Vector;
    scale: number;
};

type RectangleMakerHelpers = { [key in VERTEX_ROLES]: VertexRenderer };

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
            [VERTEX_ROLES.TOP_LEFT]: new VertexRenderer({
                slide: this._slide,
                parent: this.getTarget(),
                center: this._rectangle.getOrigin(),
                scale: args.scale,
                role: VERTEX_ROLES.TOP_LEFT
            }),
            [VERTEX_ROLES.TOP_RIGHT]: new VertexRenderer({
                slide: this._slide,
                parent: this.getTarget(),
                center: this._rectangle.getOrigin().add(new Vector(this._rectangle.getWidth(), 0)),
                scale: args.scale,
                role: VERTEX_ROLES.TOP_RIGHT
            }),
            [VERTEX_ROLES.BOTTOM_LEFT]: new VertexRenderer({
                slide: this._slide,
                parent: this.getTarget(),
                center: this._rectangle.getOrigin().add(new Vector(0, this._rectangle.getHeight())),
                scale: args.scale,
                role: VERTEX_ROLES.BOTTOM_LEFT
            }),
            [VERTEX_ROLES.BOTTOM_RIGHT]: new VertexRenderer({
                slide: this._slide,
                parent: this.getTarget(),
                center: this._rectangle.getOrigin().add(new Vector(this._rectangle.getWidth(), this._rectangle.getHeight())),
                scale: args.scale,
                role: VERTEX_ROLES.BOTTOM_RIGHT
            })
        };

        // Render primary graphic
        this._rectangle.render();

        // Render helper graphics
        this._helpers[VERTEX_ROLES.TOP_LEFT].render();
        this._helpers[VERTEX_ROLES.TOP_RIGHT].render();
        this._helpers[VERTEX_ROLES.BOTTOM_LEFT].render();
        this._helpers[VERTEX_ROLES.BOTTOM_RIGHT].render();
    }

    public getTarget(): RectangleRenderer {
        return this._rectangle;
    }

    public setScale(scale: number): void {
        this._helpers[VERTEX_ROLES.TOP_LEFT].setScale(scale);
        this._helpers[VERTEX_ROLES.TOP_RIGHT].setScale(scale);
        this._helpers[VERTEX_ROLES.BOTTOM_LEFT].setScale(scale);
        this._helpers[VERTEX_ROLES.BOTTOM_RIGHT].setScale(scale);
    }

    public complete(): void {
        this._slide.setGraphic(this._rectangle);

        // Remove helper graphics
        this._helpers[VERTEX_ROLES.TOP_LEFT].unrender();
        this._helpers[VERTEX_ROLES.TOP_RIGHT].unrender();
        this._helpers[VERTEX_ROLES.BOTTOM_LEFT].unrender();
        this._helpers[VERTEX_ROLES.BOTTOM_RIGHT].unrender();
    }

    public resize(position: Vector, shift: boolean, ctrl: boolean, alt: boolean): void {
        // If shift is pressed, constrain to square
        const directions = [Vector.northeast, Vector.northwest, Vector.southeast, Vector.southwest];
        const rawOffset = this._initialPosition.towards(position);
        const offset = shift ? rawOffset.projectOn(closestVector(rawOffset, directions)) : rawOffset;

        if (ctrl) {
            const dimensions = offset.transform(Math.abs).scale(2);
            const originOffset = offset.transform(Math.abs).scale(-1);
            this._rectangle.setOrigin(this._initialPosition.add(originOffset));
            this._rectangle.setWidth(dimensions.x);
            this._rectangle.setHeight(dimensions.y);
        } else {
            const dimensions = offset.transform(Math.abs);
            const originOffset = offset.scale(0.5).add(dimensions.scale(-0.5));
            this._rectangle.setOrigin(this._initialPosition.add(originOffset));
            this._rectangle.setWidth(dimensions.x);
            this._rectangle.setHeight(dimensions.y);
        }

        // Update helper graphics
        this._helpers[VERTEX_ROLES.TOP_LEFT].setCenter(this._rectangle.getOrigin());
        this._helpers[VERTEX_ROLES.TOP_RIGHT].setCenter(this._rectangle.getOrigin().add(new Vector(this._rectangle.getWidth(), 0)));
        this._helpers[VERTEX_ROLES.BOTTOM_LEFT].setCenter(this._rectangle.getOrigin().add(new Vector(0, this._rectangle.getHeight())));
        this._helpers[VERTEX_ROLES.BOTTOM_RIGHT].setCenter(this._rectangle.getOrigin().add(new Vector(this._rectangle.getWidth(), this._rectangle.getHeight())));
    }
}

export default RectangleMaker;
