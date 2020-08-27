import { RectangleOutlineRenderer } from '../helpers';
import SlideRenderer from '../SlideRenderer';
import { GraphicMarker, IImageRenderer } from '../types';

type ImageMarkerArgs = {
    slide: SlideRenderer;
    target: IImageRenderer;
    scale: number;
};

class ImageMarker implements GraphicMarker {
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

    public unmark(): void {
        this.helper.unrender();
    }

    public setScale(scale: number): void {
        this.helper.scale = scale;
    }
}

export default ImageMarker;
