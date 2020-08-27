import { provideId } from '@/utilities/IdProvider';
import Vector from '@/utilities/Vector';
import { CurveRenderer } from '../graphics';
import { CurveAnchorRenderer } from '../helpers';
import SlideRenderer from '../SlideRenderer';
import { CurveAnchor, GraphicMaker, ICurveRenderer } from '../types';

type CurveMakerArgs = {
    slide: SlideRenderer;
    initialPosition: Vector;
    scale: number;
};

class CurveMaker implements GraphicMaker {
    public readonly target: ICurveRenderer;
    private _slide: SlideRenderer;
    private _helper: CurveAnchorRenderer;

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

    public addAnchor(anchor: CurveAnchor): { setHandles: (position: Vector) => void; setPoint: (position: Vector) => void } {
        const anchorIndex = this.target.addAnchor(anchor);

        // Update helper graphic
        this._helper.inHandle = anchor.inHandle;
        this._helper.point = anchor.point;
        this._helper.outHandle = anchor.outHandle;

        return {
            setHandles: position => {
                anchor.inHandle = position.reflect(anchor.point);
                anchor.outHandle = position;
                this.target.setAnchor(anchorIndex, anchor);
                this._helper.inHandle = anchor.inHandle;
                this._helper.outHandle = anchor.outHandle;
            },
            setPoint: position => {
                anchor.point = position;
                this.target.setAnchor(anchorIndex, anchor);
                this._helper.point = anchor.point;
            }
        };
    }
}

export default CurveMaker;
