import { CurveOutlineRenderer } from '../helpers';
import { ICurveRenderer, IGraphicCreator, ISlideRenderer } from '../types';

class CurveHighlighter implements IGraphicCreator {
    protected helper: CurveOutlineRenderer;

    constructor({
        slide,
        target,
        scale
    }: {
        slide: ISlideRenderer;
        target: ICurveRenderer;
        scale: number;
    }) {
        this.helper = new CurveOutlineRenderer({
            slide,
            scale,
            anchors: target.anchors,
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

export default CurveHighlighter;
