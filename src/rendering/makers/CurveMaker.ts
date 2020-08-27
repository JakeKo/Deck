import { SlideMouseEvent } from '@/events/types';
import { resolvePosition } from '@/tools/utilities';
import { provideId } from '@/utilities/IdProvider';
import Vector from '@/utilities/Vector';
import { CurveRenderer } from '../graphics';
import { CurveAnchorRenderer } from '../helpers';
import { CurveAnchor, ICurveAnchorRenderer, ICurveMaker, ICurveRenderer, ISlideRenderer } from '../types';

type CurveMakerArgs = {
    slide: ISlideRenderer;
    initialPosition: Vector;
    scale: number;
};

class CurveMaker implements ICurveMaker {
    public readonly target: ICurveRenderer;
    private _slide: ISlideRenderer;
    private _helper: ICurveAnchorRenderer;

    constructor(args: CurveMakerArgs) {
        this._slide = args.slide;

        // Inititalize primary graphic
        this.target = new CurveRenderer({
            id: provideId(),
            slide: this._slide
        });

        // Initialize helper graphic
        this._helper = new CurveAnchorRenderer({
            slide: this._slide,
            scale: args.scale,
            inHandle: args.initialPosition,
            point: args.initialPosition,
            outHandle: args.initialPosition,
            parentId: this.target.id,
            index: -1
        });

        // Render primary graphic
        this.target.render();

        // Render helper graphic
        this._helper.render();
    }

    public set scale(scale: number) {
        this._helper.scale = scale;
    }

    // TODO: Consider returning graphic so setGraphic may be called outside makers
    public complete(): void {
        // Trim the last anchor and persist
        this.target.removeAnchor(this.target.anchors.length - 1);
        this._slide.setGraphic(this.target);

        // Remove helper graphics
        this._helper.unrender();
    }

    public anchorListeners(anchor: CurveAnchor): { setPoint: (event: SlideMouseEvent) => void; setHandles: (event: SlideMouseEvent) => void } {
        const anchorIndex = this.target.addAnchor(anchor);

        // Update helper graphic
        this._helper.inHandle = anchor.inHandle;
        this._helper.point = anchor.point;
        this._helper.outHandle = anchor.outHandle;

        return {
            setPoint: event => {
                const { baseEvent, slide } = event.detail;
                const position = resolvePosition(baseEvent, slide);
                anchor.point = position;
                this.target.setAnchor(anchorIndex, anchor);
                this._helper.point = anchor.point;
            },
            setHandles: event => {
                const { baseEvent, slide } = event.detail;
                const position = resolvePosition(baseEvent, slide);
                anchor.inHandle = position.reflect(anchor.point);
                anchor.outHandle = position;
                this.target.setAnchor(anchorIndex, anchor);
                this._helper.inHandle = anchor.inHandle;
                this._helper.outHandle = anchor.outHandle;
            }
        };
    }
}

export default CurveMaker;
