import { provideId } from "../../utilities/IdProvider";
import Vector from "../../utilities/Vector";
import { VideoRenderer } from "../graphics";
import { VertexRenderer } from "../helpers";
import SlideRenderer from "../SlideRenderer";
import { GraphicMaker } from "../types";

type VideoMakerArgs = {
    slide: SlideRenderer;
    initialPosition: Vector;
    scale: number;
    source: HTMLVideoElement;
    width: number;
    height: number;
};

type VideoMakerHelpers = {
    topLeft: VertexRenderer,
    topRight: VertexRenderer,
    bottomLeft: VertexRenderer,
    bottomRight: VertexRenderer
};

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
            topLeft: new VertexRenderer({
                slide: this._slide,
                center: this._video.getOrigin(),
                scale: args.scale
            }),
            topRight: new VertexRenderer({
                slide: this._slide,
                center: this._video.getOrigin().add(new Vector(this._video.getWidth(), 0)),
                scale: args.scale
            }),
            bottomLeft: new VertexRenderer({
                slide: this._slide,
                center: this._video.getOrigin().add(new Vector(0, this._video.getHeight())),
                scale: args.scale
            }),
            bottomRight: new VertexRenderer({
                slide: this._slide,
                center: this._video.getOrigin().add(new Vector(this._video.getWidth(), this._video.getHeight())),
                scale: args.scale
            })
        };

        // Render primary graphic
        this._video.render();

        // Render helper graphics
        this._helpers.topLeft.render();
        this._helpers.topRight.render();
        this._helpers.bottomLeft.render();
        this._helpers.bottomRight.render();
    }

    public getTarget(): VideoRenderer {
        return this._video;
    }

    public setScale(scale: number): void {
        this._helpers.topLeft.setScale(scale);
        this._helpers.topRight.setScale(scale);
        this._helpers.bottomLeft.setScale(scale);
        this._helpers.bottomRight.setScale(scale);
    }

    public complete(): void {
        this._slide.setGraphic(this._video);

        // Remove helper graphics
        this._helpers.topLeft.unrender();
        this._helpers.topRight.unrender();
        this._helpers.bottomLeft.unrender();
        this._helpers.bottomRight.unrender();
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
        this._helpers.topLeft.setCenter(this._video.getOrigin());
        this._helpers.topRight.setCenter(this._video.getOrigin().add(new Vector(this._video.getWidth(), 0)));
        this._helpers.bottomLeft.setCenter(this._video.getOrigin().add(new Vector(0, this._video.getHeight())));
        this._helpers.bottomRight.setCenter(this._video.getOrigin().add(new Vector(this._video.getWidth(), this._video.getHeight())));
    }
}

export default VideoMaker;
