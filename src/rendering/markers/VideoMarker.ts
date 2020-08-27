import { RectangleOutlineRenderer } from '../helpers';
import { IGraphicMarker, ISlideRenderer, IVideoRenderer } from '../types';

type VideoMarkerArgs = {
    slide: ISlideRenderer;
    target: IVideoRenderer;
    scale: number;
};

class VideoMarker implements IGraphicMarker {
    public helper: RectangleOutlineRenderer;

    constructor(args: VideoMarkerArgs) {
        this.helper = new RectangleOutlineRenderer({
            slide: args.slide,
            scale: args.scale,
            origin: args.target.origin,
            dimensions: args.target.dimensions,
            rotation: args.target.rotation
        });

        this.helper.render();
    }

    public set scale(scale: number) {
        this.helper.scale = scale;
    }

    public unmark(): void {
        this.helper.unrender();
    }
}

export default VideoMarker;
