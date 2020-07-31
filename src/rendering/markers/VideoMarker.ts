import { VideoRenderer } from "../graphics";
import RectangleOutlineRenderer from "../helpers/RectangleOutlineRenderer";
import SlideRenderer from "../SlideRenderer";
import { GraphicMarker } from "../types";

type VideoMarkerArgs = {
    slide: SlideRenderer;
    target: VideoRenderer;
    scale: number;
};

class VideoMarker implements GraphicMarker {
    private _slide: SlideRenderer;
    private _target: VideoRenderer;
    private _scale: number;
    private _helper: RectangleOutlineRenderer;

    constructor(args: VideoMarkerArgs) {
        this._slide = args.slide;
        this._target = args.target;
        this._scale = args.scale;

        this._helper = new RectangleOutlineRenderer({
            slide: this._slide,
            scale: this._scale,
            origin: this._target.getOrigin(),
            width: this._target.getWidth(),
            height: this._target.getHeight()
        });

        this._helper.render();
    }

    public unmark(): void {
        this._helper.unrender();
    }

    public setScale(scale: number): void {
        this._helper.setScale(scale);
    }
}

export default VideoMarker;
