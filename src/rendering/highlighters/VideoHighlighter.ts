import { RectangleOutlineRenderer } from '../helpers';
import { IGraphicHighlighter, ISlideRenderer, IVideoRenderer } from '../types';

class VideoHighlighter implements IGraphicHighlighter {
    protected helper: RectangleOutlineRenderer;

    constructor({
        slide,
        target,
        scale
    }: {
        slide: ISlideRenderer;
        target: IVideoRenderer;
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

    public unhighlight(): void {
        this.helper.unrender();
    }
}

export default VideoHighlighter;
