import { provideId } from "../../utilities/IdProvider";
import { closestVector } from "../../utilities/utilities";
import Vector from "../../utilities/Vector";
import { TextboxRenderer } from "../graphics";
import { RectangleOutlineRenderer, VertexRenderer } from "../helpers";
import SlideRenderer from "../SlideRenderer";
import { GraphicMaker, VERTEX_ROLES } from "../types";

type TextboxMakerArgs = {
    slide: SlideRenderer;
    initialPosition: Vector;
    scale: number;
};

type TextboxMakerHelpers = { [key in VERTEX_ROLES]: VertexRenderer } & {
    outline: RectangleOutlineRenderer;
};

class TextboxMaker implements GraphicMaker {
    private _target: TextboxRenderer;
    private _slide: SlideRenderer;
    private _initialPosition: Vector;
    private _helpers: TextboxMakerHelpers;

    constructor(args: TextboxMakerArgs) {
        this._slide = args.slide;
        this._initialPosition = args.initialPosition;

        // TODO: Aggregate snap vectors here
        // Initialize primary graphic
        this._target = new TextboxRenderer({
            id: provideId(),
            slide: this._slide,
            origin: this._initialPosition
        });

        // Initialize helper graphics
        this._helpers = {
            [VERTEX_ROLES.TOP_LEFT]: new VertexRenderer({
                slide: this._slide,
                parent: this.getTarget(),
                center: this._target.getOrigin(),
                scale: args.scale,
                role: VERTEX_ROLES.TOP_LEFT
            }),
            [VERTEX_ROLES.TOP_RIGHT]: new VertexRenderer({
                slide: this._slide,
                parent: this.getTarget(),
                center: this._target.getOrigin().add(new Vector(this._target.getWidth(), 0)),
                scale: args.scale,
                role: VERTEX_ROLES.TOP_RIGHT
            }),
            [VERTEX_ROLES.BOTTOM_LEFT]: new VertexRenderer({
                slide: this._slide,
                parent: this.getTarget(),
                center: this._target.getOrigin().add(new Vector(0, this._target.getHeight())),
                scale: args.scale,
                role: VERTEX_ROLES.BOTTOM_LEFT
            }),
            [VERTEX_ROLES.BOTTOM_RIGHT]: new VertexRenderer({
                slide: this._slide,
                parent: this.getTarget(),
                center: this._target.getOrigin().add(new Vector(this._target.getWidth(), this._target.getHeight())),
                scale: args.scale,
                role: VERTEX_ROLES.BOTTOM_RIGHT
            }),
            outline: new RectangleOutlineRenderer({
                slide: this._slide,
                scale: args.scale,
                origin: this._target.getOrigin(),
                width: this._target.getWidth(),
                height: this._target.getHeight()
            })
        };

        // Render primary graphic
        this._target.render();

        // Render helper graphics
        this._helpers[VERTEX_ROLES.TOP_LEFT].render();
        this._helpers[VERTEX_ROLES.TOP_RIGHT].render();
        this._helpers[VERTEX_ROLES.BOTTOM_LEFT].render();
        this._helpers[VERTEX_ROLES.BOTTOM_RIGHT].render();
        this._helpers.outline.render();
    }

    public getTarget(): TextboxRenderer {
        return this._target;
    }

    public setScale(scale: number): void {
        this._helpers[VERTEX_ROLES.TOP_LEFT].setScale(scale);
        this._helpers[VERTEX_ROLES.TOP_RIGHT].setScale(scale);
        this._helpers[VERTEX_ROLES.BOTTOM_LEFT].setScale(scale);
        this._helpers[VERTEX_ROLES.BOTTOM_RIGHT].setScale(scale);
        this._helpers.outline.setScale(scale);
    }

    public complete(): void {
        this._slide.setGraphic(this._target);

        // Remove helper graphics
        this._helpers[VERTEX_ROLES.TOP_LEFT].unrender();
        this._helpers[VERTEX_ROLES.TOP_RIGHT].unrender();
        this._helpers[VERTEX_ROLES.BOTTOM_LEFT].unrender();
        this._helpers[VERTEX_ROLES.BOTTOM_RIGHT].unrender();
        this._helpers.outline.unrender();
    }

    public resize(position: Vector, shift: boolean, ctrl: boolean, alt: boolean): void {
        // If shift is pressed, constrain to square
        const directions = [Vector.northeast, Vector.northwest, Vector.southeast, Vector.southwest];
        const rawOffset = this._initialPosition.towards(position);
        const offset = shift ? rawOffset.projectOn(closestVector(rawOffset, directions)) : rawOffset;

        if (ctrl) {
            const dimensions = offset.transform(Math.abs).scale(2);
            const originOffset = offset.transform(Math.abs).scale(-1);
            this._target.setOrigin(this._initialPosition.add(originOffset));
            this._target.setWidth(dimensions.x);
            this._target.setHeight(dimensions.y);
        } else {
            const dimensions = offset.transform(Math.abs);
            const originOffset = offset.scale(0.5).add(dimensions.scale(-0.5));
            this._target.setOrigin(this._initialPosition.add(originOffset));
            this._target.setWidth(dimensions.x);
            this._target.setHeight(dimensions.y);
        }

        // Update helper graphics
        this._helpers[VERTEX_ROLES.TOP_LEFT].setCenter(this._target.getOrigin());
        this._helpers[VERTEX_ROLES.TOP_RIGHT].setCenter(this._target.getOrigin().add(new Vector(this._target.getWidth(), 0)));
        this._helpers[VERTEX_ROLES.BOTTOM_LEFT].setCenter(this._target.getOrigin().add(new Vector(0, this._target.getHeight())));
        this._helpers[VERTEX_ROLES.BOTTOM_RIGHT].setCenter(this._target.getOrigin().add(new Vector(this._target.getWidth(), this._target.getHeight())));
        this._helpers.outline.setOrigin(this._target.getOrigin());
        this._helpers.outline.setWidth(this._target.getWidth());
        this._helpers.outline.setHeight(this._target.getHeight());
    }
}

export default TextboxMaker;
