import { RectangleOutlineRenderer } from '../helpers';
import { IGraphicMarker, IImageRenderer, ISlideRenderer } from '../types';

type ImageMarkerArgs = {
    slide: ISlideRenderer;
    target: IImageRenderer;
    scale: number;
};

class ImageMarker implements IGraphicMarker {
    public helper: RectangleOutlineRenderer;

    constructor(args: ImageMarkerArgs) {
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

export default ImageMarker;
