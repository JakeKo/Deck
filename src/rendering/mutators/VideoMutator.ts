import { SlideMouseEvent } from "../../events/types";
import { resolvePosition } from "../../tools/utilities";
import { closestVector } from "../../utilities/utilities";
import Vector from "../../utilities/Vector";
import { VideoRenderer } from "../graphics";
import SlideRenderer from "../SlideRenderer";
import { BoundingBoxMutatorHelpers, GraphicMutator, GRAPHIC_TYPES, VERTEX_ROLES } from "../types";
import { makeBoxHelpers, renderBoxHelpers, resizeBoxHelpers, scaleBoxHelpers, unrenderBoxHelpers } from "../utilities";

type VideoMutatorArgs = {
    target: VideoRenderer;
    slide: SlideRenderer;
    scale: number;
};

class VideoMutator implements GraphicMutator {
    public target: VideoRenderer;
    public helpers: BoundingBoxMutatorHelpers;

    constructor(args: VideoMutatorArgs) {
        this.target = args.target;

        // Initialize helper targets
        this.helpers = makeBoxHelpers(this.target, args.slide, args.scale);

        // Render helper targets
        renderBoxHelpers(this.helpers);
    }

    public getType(): GRAPHIC_TYPES {
        return GRAPHIC_TYPES.VIDEO;
    }

    public getTarget(): VideoRenderer {
        return this.target;
    }

    // TODO: Account for ctrl, alt, and snapping
    public get boxListeners(): { [key in VERTEX_ROLES]: (event: SlideMouseEvent) => void } {
        const box = this.target.getBoundingBox();
        const directions = [
            box.dimensions,
            box.dimensions.signAs(Vector.northwest),
            box.dimensions.signAs(Vector.southwest),
            box.dimensions.signAs(Vector.southeast)
        ];

        const makeListener = (oppositeCorner: Vector): (event: SlideMouseEvent) => void => {
            return event => {
                const { baseEvent, slide } = event.detail;
                const position = resolvePosition(baseEvent, slide);
                const rawOffset = oppositeCorner.towards(position);
                const offset = rawOffset.projectOn(closestVector(rawOffset, directions));

                const dimensions = offset.abs;
                const origin = oppositeCorner.add(offset.scale(0.5).add(dimensions.scale(-0.5)));

                // Update rendering
                this.target.setOrigin(origin);
                this.target.setWidth(dimensions.x);
                this.target.setHeight(dimensions.y);
                this._repositionBoxHelpers();
            };
        };

        return {
            [VERTEX_ROLES.TOP_LEFT]: makeListener(box.bottomRight),
            [VERTEX_ROLES.TOP_RIGHT]: makeListener(box.bottomLeft),
            [VERTEX_ROLES.BOTTOM_LEFT]: makeListener(box.topRight),
            [VERTEX_ROLES.BOTTOM_RIGHT]: makeListener(box.topLeft)
        };
    }

    // TODO: Account for alt and snapping
    public graphicMoveHandler(): (position: Vector, shift: boolean, alt: boolean) => void {
        const initialOrigin = this.target.getOrigin();
        const directions = [Vector.east, Vector.northeast, Vector.north, Vector.northwest, Vector.west, Vector.southwest, Vector.south, Vector.southeast];

        return (position, shift, alt) => {
            const rawMove = initialOrigin.towards(position);
            const moveDirection = (shift ? closestVector(rawMove, directions) : rawMove).normalized;
            const move = rawMove.projectOn(moveDirection);

            this.target.setOrigin(initialOrigin.add(move));
            this._repositionBoxHelpers();
        };
    }

    // TODO: Include methods for other mutations

    public complete(): void {
        // Remove helper graphics
        unrenderBoxHelpers(this.helpers);
    }

    public setScale(scale: number): void {
        scaleBoxHelpers(this.helpers, scale);
    }

    private _repositionBoxHelpers(): void {
        resizeBoxHelpers(this.helpers, this.target.getBoundingBox());
    }
}

export default VideoMutator;
