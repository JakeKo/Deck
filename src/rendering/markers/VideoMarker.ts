import { VideoRenderer } from "../graphics";
import { BoxRenderer } from "../helpers";
import SlideRenderer from "../SlideRenderer";
import { GraphicMarker } from "../types";

type VideoMarkerArgs = {
    slide: SlideRenderer;
    target: VideoRenderer;
    scale: number;
};

class VideoMarker implements GraphicMarker {
    public helper: BoxRenderer;

    constructor(args: VideoMarkerArgs) {
        this.helper = new BoxRenderer({
            slide: args.slide,
            scale: args.scale,
            origin: args.target.getOrigin(),
            width: args.target.getWidth(),
            height: args.target.getHeight()
        });

        this.helper.render();
    }

    public unmark(): void {
        this.helper.unrender();
    }

    public setScale(scale: number): void {
        this.helper.setScale(scale);
    }
}

export default VideoMarker;
