import { provideId } from "../../utilities/IdProvider";
import { closestVector } from "../../utilities/utilities";
import Vector from "../../utilities/Vector";
import { VideoRenderer } from "../graphics";
import { VertexRenderer } from "../helpers";
import RectangleOutlineRenderer from "../helpers/RectangleOutlineRenderer";
import SlideRenderer from "../SlideRenderer";
import { GraphicMaker, VERTEX_ROLES } from "../types";

type VideoMakerArgs = {
    slide: SlideRenderer;
    initialPosition: Vector;
    scale: number;
    source: HTMLVideoElement;
    width: number;
    height: number;
};

type VideoMakerHelpers = { [key in VERTEX_ROLES]: VertexRenderer } & {
    outline: RectangleOutlineRenderer;
};

class VideoMaker implements GraphicMaker {
    private _target: VideoRenderer;
    private _slide: SlideRenderer;
    private _initialPosition: Vector;
    private _width: number;
    private _height: number;
    private _helpers: VideoMakerHelpers;

    constructor(args: VideoMakerArgs) {
        this._slide = args.slide;
        this._initialPosition = args.initialPosition;
        this._width = args.width;
        this._height = args.height;

        // Initialize primary graphic
        this._target = new VideoRenderer({
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

    public getTarget(): VideoRenderer {
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

    // Some trig, for your enjoyment
    public resize(position: Vector, shift: boolean, ctrl: boolean, alt: boolean): void {
        const size = new Vector(this._width, this._height).normalized;
        const directions = [size, size.signAs(Vector.southeast), size.signAs(Vector.southwest), size.signAs(Vector.northwest)];
        const rawOffset = this._initialPosition.towards(position);
        const offset = rawOffset.projectOn(closestVector(rawOffset, directions));

        if (ctrl) {
            const dimensions = offset.abs.scale(2);
            const originOffset = offset.abs.scale(-1);
            this._target.setOrigin(this._initialPosition.add(originOffset));
            this._target.setWidth(dimensions.x);
            this._target.setHeight(dimensions.y);
        } else {
            const dimensions = offset.abs;
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

export default VideoMaker;
