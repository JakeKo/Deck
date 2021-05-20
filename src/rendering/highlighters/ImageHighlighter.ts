import { RectangleOutlineRenderer } from '../helpers';
import { IGraphicCreator, IImageRenderer, ISlideRenderer } from '../types';

class ImageHighlighter implements IGraphicCreator {
    protected helper: RectangleOutlineRenderer;

    constructor({
        slide,
        target,
        scale
    }: {
        slide: ISlideRenderer;
        target: IImageRenderer;
        scale: number;
    }) {
        this.helper = new RectangleOutlineRenderer({
            slide,
            scale,
            origin: target.origin,
            dimensions: target.dimensions,
            rotation: target.rotation
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

export default ImageHighlighter;
