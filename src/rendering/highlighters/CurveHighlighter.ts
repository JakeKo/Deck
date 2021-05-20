import { CurveOutlineRenderer } from '../helpers';
import { ICurveRenderer, IGraphicHighlighter, ISlideRenderer } from '../types';

class CurveHighlighter implements IGraphicHighlighter {
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

    public unhighlight(): void {
        this.helper.unrender();
    }
}

export default CurveHighlighter;
