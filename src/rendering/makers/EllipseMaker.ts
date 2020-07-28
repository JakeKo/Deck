import { provideId } from "../../utilities/IdProvider";
import { closestVector } from "../../utilities/utilities";
import Vector from "../../utilities/Vector";
import { EllipseRenderer } from "../graphics";
import { VertexRenderer } from "../helpers";
import EllipseOutlineRenderer from "../helpers/EllipseOutlineRenderer";
import SlideRenderer from "../SlideRenderer";
import { GraphicMaker, VERTEX_ROLES } from "../types";

type EllipseMakerArgs = {
    slide: SlideRenderer;
    initialPosition: Vector;
    scale: number;
};

type EllipseMakerHelpers = {
    [VERTEX_ROLES.TOP_LEFT]: VertexRenderer;
    [VERTEX_ROLES.TOP_RIGHT]: VertexRenderer;
    [VERTEX_ROLES.BOTTOM_LEFT]: VertexRenderer;
    [VERTEX_ROLES.BOTTOM_RIGHT]: VertexRenderer;
    outline: EllipseOutlineRenderer;
};

class EllipseMaker implements GraphicMaker {
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
            center: this._initialPosition
        });

        // Initialize helper graphics
        this._helpers = {
            [VERTEX_ROLES.TOP_LEFT]: new VertexRenderer({
                slide: this._slide,
                parent: this.getTarget(),
                center: this._ellipse.getCenter(),
                scale: args.scale,
                role: VERTEX_ROLES.TOP_LEFT
            }),
            [VERTEX_ROLES.TOP_RIGHT]: new VertexRenderer({
                slide: this._slide,
                parent: this.getTarget(),
                center: this._ellipse.getCenter().add(new Vector(this._ellipse.getWidth(), 0)),
                scale: args.scale,
                role: VERTEX_ROLES.TOP_RIGHT
            }),
            [VERTEX_ROLES.BOTTOM_LEFT]: new VertexRenderer({
                slide: this._slide,
                parent: this.getTarget(),
                center: this._ellipse.getCenter().add(new Vector(0, this._ellipse.getHeight())),
                scale: args.scale,
                role: VERTEX_ROLES.BOTTOM_LEFT
            }),
            [VERTEX_ROLES.BOTTOM_RIGHT]: new VertexRenderer({
                slide: this._slide,
                parent: this.getTarget(),
                center: this._ellipse.getCenter().add(new Vector(this._ellipse.getWidth(), this._ellipse.getHeight())),
                scale: args.scale,
                role: VERTEX_ROLES.BOTTOM_RIGHT
            }),
            outline: new EllipseOutlineRenderer({
                slide: this._slide,
                center: this._ellipse.getCenter(),
                width: this._ellipse.getWidth(),
                height: this._ellipse.getHeight(),
                scale: args.scale
            })
        };

        // Render primary graphic
        this._ellipse.render();

        // Render helper graphics
        this._helpers[VERTEX_ROLES.TOP_LEFT].render();
        this._helpers[VERTEX_ROLES.TOP_RIGHT].render();
        this._helpers[VERTEX_ROLES.BOTTOM_LEFT].render();
        this._helpers[VERTEX_ROLES.BOTTOM_RIGHT].render();
        this._helpers.outline.render();
    }

    public getTarget(): EllipseRenderer {
        return this._ellipse;
    }

    public complete(): void {
        this._slide.setGraphic(this._ellipse);

        // Remove helper graphics
        this._helpers[VERTEX_ROLES.TOP_LEFT].unrender();
        this._helpers[VERTEX_ROLES.TOP_RIGHT].unrender();
        this._helpers[VERTEX_ROLES.BOTTOM_LEFT].unrender();
        this._helpers[VERTEX_ROLES.BOTTOM_RIGHT].unrender();
        this._helpers.outline.unrender();
    }

    public setScale(scale: number): void {
        this._helpers[VERTEX_ROLES.TOP_LEFT].setScale(scale);
        this._helpers[VERTEX_ROLES.TOP_RIGHT].setScale(scale);
        this._helpers[VERTEX_ROLES.BOTTOM_LEFT].setScale(scale);
        this._helpers[VERTEX_ROLES.BOTTOM_RIGHT].setScale(scale);
        this._helpers.outline.setScale(scale);
    }

    public resize(position: Vector, shift: boolean, ctrl: boolean, alt: boolean): void {
        // If shift is pressed, constrain to circle
        const directions = [Vector.northeast, Vector.northwest, Vector.southeast, Vector.southwest];
        const rawOffset = this._initialPosition.towards(position);
        const offset = shift ? rawOffset.projectOn(closestVector(rawOffset, directions)) : rawOffset;

        if (ctrl) {
            const dimensions = offset.transform(Math.abs).scale(2);
            this._ellipse.setCenter(this._initialPosition);
            this._ellipse.setWidth(dimensions.x);
            this._ellipse.setHeight(dimensions.y);
        } else {
            const dimensions = offset.transform(Math.abs);
            const originOffset = offset.scale(0.5);
            this._ellipse.setCenter(this._initialPosition.add(originOffset));
            this._ellipse.setWidth(dimensions.x);
            this._ellipse.setHeight(dimensions.y);
        }

        // Update helper graphics
        const center = this._ellipse.getCenter();
        const radius = new Vector(this._ellipse.getWidth(), this._ellipse.getHeight()).scale(0.5);
        this._helpers[VERTEX_ROLES.TOP_LEFT].setCenter(center.add(radius.scale(-1)));
        this._helpers[VERTEX_ROLES.TOP_RIGHT].setCenter(center.add(radius.signAs(Vector.southeast)));
        this._helpers[VERTEX_ROLES.BOTTOM_LEFT].setCenter(center.add(radius));
        this._helpers[VERTEX_ROLES.BOTTOM_RIGHT].setCenter(center.add(radius.signAs(Vector.northwest)));
        this._helpers.outline.setCenter(center);
        this._helpers.outline.setWidth(this._ellipse.getWidth());
        this._helpers.outline.setHeight(this._ellipse.getHeight());
    }
}

export default EllipseMaker;
