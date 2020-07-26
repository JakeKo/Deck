import { provideId } from "../../utilities/IdProvider";
import Vector from "../../utilities/Vector";
import { VideoRenderer } from "../graphics";
import { VertexRenderer } from "../helpers";
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

type VideoMakerHelpers = { [key in VERTEX_ROLES]: VertexRenderer };

class VideoMaker implements GraphicMaker {
    private _video: VideoRenderer;
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
        this._video = new VideoRenderer({
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
                center: this._video.getOrigin(),
                scale: args.scale,
                role: VERTEX_ROLES.TOP_LEFT
            }),
            [VERTEX_ROLES.TOP_RIGHT]: new VertexRenderer({
                slide: this._slide,
                parent: this.getTarget(),
                center: this._video.getOrigin().add(new Vector(this._video.getWidth(), 0)),
                scale: args.scale,
                role: VERTEX_ROLES.TOP_RIGHT
            }),
            [VERTEX_ROLES.BOTTOM_LEFT]: new VertexRenderer({
                slide: this._slide,
                parent: this.getTarget(),
                center: this._video.getOrigin().add(new Vector(0, this._video.getHeight())),
                scale: args.scale,
                role: VERTEX_ROLES.BOTTOM_LEFT
            }),
            [VERTEX_ROLES.BOTTOM_RIGHT]: new VertexRenderer({
                slide: this._slide,
                parent: this.getTarget(),
                center: this._video.getOrigin().add(new Vector(this._video.getWidth(), this._video.getHeight())),
                scale: args.scale,
                role: VERTEX_ROLES.BOTTOM_RIGHT
            })
        };

        // Render primary graphic
        this._video.render();

        // Render helper graphics
        this._helpers[VERTEX_ROLES.TOP_LEFT].render();
        this._helpers[VERTEX_ROLES.TOP_RIGHT].render();
        this._helpers[VERTEX_ROLES.BOTTOM_LEFT].render();
        this._helpers[VERTEX_ROLES.BOTTOM_RIGHT].render();
    }

    public getTarget(): VideoRenderer {
        return this._video;
    }

    public setScale(scale: number): void {
        this._helpers[VERTEX_ROLES.TOP_LEFT].setScale(scale);
        this._helpers[VERTEX_ROLES.TOP_RIGHT].setScale(scale);
        this._helpers[VERTEX_ROLES.BOTTOM_LEFT].setScale(scale);
        this._helpers[VERTEX_ROLES.BOTTOM_RIGHT].setScale(scale);
    }

    public complete(): void {
        this._slide.setGraphic(this._video);

        // Remove helper graphics
        this._helpers[VERTEX_ROLES.TOP_LEFT].unrender();
        this._helpers[VERTEX_ROLES.TOP_RIGHT].unrender();
        this._helpers[VERTEX_ROLES.BOTTOM_LEFT].unrender();
        this._helpers[VERTEX_ROLES.BOTTOM_RIGHT].unrender();
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
            this._video.setOrigin(this._initialPosition.add(originOffset));
            this._video.setWidth(dimensions.x);
            this._video.setHeight(dimensions.y);
        } else {
            const dimensions = dimensionOffset.abs;
            const originOffset = dimensionOffset.scale(0.5).add(dimensions.scale(-0.5));
            this._video.setOrigin(this._initialPosition.add(originOffset));
            this._video.setWidth(dimensions.x);
            this._video.setHeight(dimensions.y);
        }

        // Update helper graphics
        this._helpers[VERTEX_ROLES.TOP_LEFT].setCenter(this._video.getOrigin());
        this._helpers[VERTEX_ROLES.TOP_RIGHT].setCenter(this._video.getOrigin().add(new Vector(this._video.getWidth(), 0)));
        this._helpers[VERTEX_ROLES.BOTTOM_LEFT].setCenter(this._video.getOrigin().add(new Vector(0, this._video.getHeight())));
        this._helpers[VERTEX_ROLES.BOTTOM_RIGHT].setCenter(this._video.getOrigin().add(new Vector(this._video.getWidth(), this._video.getHeight())));
    }
}

export default VideoMaker;
