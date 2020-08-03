import { VideoRenderer } from "../graphics";
import { RectangleOutlineRenderer } from "../helpers";
import SlideRenderer from "../SlideRenderer";
import { GraphicMarker } from "../types";

type VideoMarkerArgs = {
    slide: SlideRenderer;
    target: VideoRenderer;
    scale: number;
};

class VideoMarker implements GraphicMarker {
    public helper: RectangleOutlineRenderer;

    constructor(args: VideoMarkerArgs) {
        this.helper = new RectangleOutlineRenderer({
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
