import Vector from "../../utilities/Vector";
import { VideoRenderer } from "../graphics";
import { VertexRenderer } from "../helpers";
import SlideRenderer from "../SlideRenderer";
import { GraphicMutator, GRAPHIC_TYPES } from "../types";

type VideoMutatorArgs = {
    video: VideoRenderer;
    slide: SlideRenderer;
    scale: number;
};

type VideoMutatorHelpers = {
    topLeft: VertexRenderer;
    topRight: VertexRenderer;
    bottomLeft: VertexRenderer;
    bottomRight: VertexRenderer;
};

class VideoMutator implements GraphicMutator {
    private _video: VideoRenderer;
    private _slide: SlideRenderer;
    private _helpers: VideoMutatorHelpers;

    constructor(args: VideoMutatorArgs) {
        this._video = args.video;
        this._slide = args.slide;

        // Initialize helper graphics
        this._helpers = {
            topLeft: new VertexRenderer({
                slide: this._slide,
                parent: this.getTarget(),
                center: this._video.getOrigin(),
                scale: args.scale,
                location: 'topLeft'
            }),
            topRight: new VertexRenderer({
                slide: this._slide,
                parent: this.getTarget(),
                center: this._video.getOrigin().add(new Vector(this._video.getWidth(), 0)),
                scale: args.scale,
                location: 'topRight'
            }),
            bottomLeft: new VertexRenderer({
                slide: this._slide,
                parent: this.getTarget(),
                center: this._video.getOrigin().add(new Vector(0, this._video.getHeight())),
                scale: args.scale,
                location: 'bottomLeft'
            }),
            bottomRight: new VertexRenderer({
                slide: this._slide,
                parent: this.getTarget(),
                center: this._video.getOrigin().add(new Vector(this._video.getWidth(), this._video.getHeight())),
                scale: args.scale,
                location: 'bottomRight'
            })
        };

        // Render helper graphics
        this._helpers.topLeft.render();
        this._helpers.topRight.render();
        this._helpers.bottomLeft.render();
        this._helpers.bottomRight.render();
    }

    public getType(): GRAPHIC_TYPES {
        return GRAPHIC_TYPES.VIDEO;
    }

    public getTarget(): VideoRenderer {
        return this._video;
    }

    // TODO: Account for shift, alt, and snapping
    public move(origin: Vector): void {
        // Update rendering
        this._video.setOrigin(origin);

        // Update helper graphics
        this._helpers.topLeft.setCenter(this._video.getOrigin());
        this._helpers.topRight.setCenter(this._video.getOrigin().add(new Vector(this._video.getWidth(), 0)));
        this._helpers.bottomLeft.setCenter(this._video.getOrigin().add(new Vector(0, this._video.getHeight())));
        this._helpers.bottomRight.setCenter(this._video.getOrigin().add(new Vector(this._video.getWidth(), this._video.getHeight())));
    }

    // TODO: Account for shift, alt, ctrl, and snapping
    public setDimensions(dimensions: Vector): void {
        // Update rendering
        this._video.setWidth(dimensions.x);
        this._video.setHeight(dimensions.y);

        // Update helper graphics
        this._helpers.topRight.setCenter(this._video.getOrigin().add(new Vector(this._video.getWidth(), 0)));
        this._helpers.bottomLeft.setCenter(this._video.getOrigin().add(new Vector(0, this._video.getHeight())));
        this._helpers.bottomRight.setCenter(this._video.getOrigin().add(new Vector(this._video.getWidth(), this._video.getHeight())));
    }

    // TODO: Account for shift, alt, and snapping
    public getVertexHandlers(): { [index: string]: () => (position: Vector) => void } {
        const makeHandler = (oppositeCorner: Vector): (position: Vector) => void => {
            return position => {
                const offset = oppositeCorner.towards(position);
                const dimensions = offset.abs;
                const origin = oppositeCorner.add(offset.scale(0.5).add(dimensions.scale(-0.5)));

                // Update rendering
                this._video.setOrigin(origin);
                this._video.setWidth(dimensions.x);
                this._video.setHeight(dimensions.y);

                // Update helper graphics
                this._helpers.topLeft.setCenter(origin);
                this._helpers.topRight.setCenter(origin.add(new Vector(dimensions.x, 0)));
                this._helpers.bottomLeft.setCenter(origin.add(new Vector(0, dimensions.y)));
                this._helpers.bottomRight.setCenter(origin.add(dimensions));
            };
        };

        return {
            'topLeft': () => {
                const oppositeCorner = this._video.getOrigin().add(new Vector(this._video.getWidth(), this._video.getHeight()));
                return makeHandler(oppositeCorner);
            },
            'topRight': () => {
                const oppositeCorner = this._video.getOrigin().add(new Vector(0, this._video.getHeight()));
                return makeHandler(oppositeCorner);
            },
            'bottomLeft': () => {
                const oppositeCorner = this._video.getOrigin().add(new Vector(this._video.getWidth(), 0));
                return makeHandler(oppositeCorner);
            },
            'bottomRight': () => {
                const oppositeCorner = this._video.getOrigin();
                return makeHandler(oppositeCorner);
            }
        };
    }

    // TODO: Include methods for other mutations

    public complete(): void {
        // Remove helper graphics
        this._helpers.topLeft.unrender();
        this._helpers.topRight.unrender();
        this._helpers.bottomLeft.unrender();
        this._helpers.bottomRight.unrender();
    }

    public setScale(scale: number): void {
        this._helpers.topLeft.setScale(scale);
        this._helpers.topRight.setScale(scale);
        this._helpers.bottomLeft.setScale(scale);
        this._helpers.bottomRight.setScale(scale);
    }
}

export default VideoMutator;
