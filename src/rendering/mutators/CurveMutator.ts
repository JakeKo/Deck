import { SlideMouseEvent } from '@/events/types';
import { resolvePosition } from '@/tools/utilities';
import { CurveMutableSerialized } from '@/types';
import { closestVector } from '@/utilities/utilities';
import V from '@/utilities/Vector';
import { CurveAnchorRenderer } from '../helpers';
import { CurveAnchor, CURVE_ANCHOR_ROLES, GRAPHIC_TYPES, ICurveMutator, ICurveRenderer, ISlideRenderer, VERTEX_ROLES } from '../types';
import { calculateMove, resizeBoxHelpers, rotateBoxHelpers, updateSnapVectors } from '../utilities';
import GraphicMutatorBase from './GraphicMutatorBase';

class CurveMutator extends GraphicMutatorBase<GRAPHIC_TYPES.CURVE, ICurveRenderer, CurveMutableSerialized> implements ICurveMutator {
    public readonly target: ICurveRenderer;

    protected anchorHelpers: CurveAnchorRenderer[];
    protected isMovingAnchor: boolean;

    constructor({
        target,
        slide,
        scale,
        graphicId,
        focus = true
    }: {
        target: ICurveRenderer;
        slide: ISlideRenderer;
        scale: number;
        graphicId: string;
        focus?: boolean;
    }) {
        super({ type: GRAPHIC_TYPES.CURVE, slide, scale, graphicId, focus });
        this.target = target;
        this.isMovingAnchor = false;

        this.anchorHelpers = this.graphic.anchors.map((anchor, index) => new CurveAnchorRenderer({
            slide: this.slide,
            scale,
            parentId: this.graphicId,
            index,
            ...anchor
        }));

        // Manually render anchorHelpers since, if focus() is called in super, anchorHelpers won't exist yet
        if (focus) {
            this.anchorHelpers.forEach(helper => helper.render());
        }
    }

    public set scale(scale: number) {
        super.scale = scale;
        this.anchorHelpers.forEach(helper => (helper.scale = scale));
    }

    /**
     * Updates the rendered helper graphics with the latest state of this mutator's targeted graphic.
     */
    public updateHelpers(): void {
        super.updateHelpers();

        if (!this.isFocusing) {
            return;
        }

        const graphic = this.graphic;
        this.anchorHelpers.forEach((_, index) => {
            const { inHandle, point, outHandle } = graphic.getAnchor(index);
            this.anchorHelpers[index].inHandle = inHandle;
            this.anchorHelpers[index].point = point;
            this.anchorHelpers[index].outHandle = outHandle;
        });
    }

    /**
     * Focus the graphic that pertains to this mutator. This will render necessary helper graphics.
     */
    public focus(): void {
        super.focus();

        if (this.isFocusing) {
            return;
        }

        this.anchorHelpers.forEach(helper => helper.render());
    }

    /**
     * Unfocus the graphic that pertains to this mutator. This will unrender all helper graphics.
     */
    public unfocus(): void {
        super.unfocus();

        if (!this.isFocusing) {
            return;
        }

        this.anchorHelpers.forEach(helper => helper.unrender());
    }

    /**
     * Initialize this mutator to begin tracking movement.
     * This returns a handler to be called on each subsequent mouse event.
     */
    public initMove(initialPosition: V): (event: SlideMouseEvent) => CurveMutableSerialized {
        this.isMoving = true;
        const graphic = this.graphic;
        const initialOrigin = graphic.getAnchor(0).point;
        const initialAnchors = graphic.anchors;
        const relativePullPoints = graphic.pullPoints.map(p => initialPosition.towards(p));
        const snapVectors = this.slide.getSnapVectors([this.graphicId]);

        return event => {
            const { shift: move, snapVectors: newSnapVectors } = calculateMove({
                initialOrigin,
                initialPosition,
                mouseEvent: event,
                snapVectors,
                relativePullPoints
            });
            const newAnchors = initialAnchors.map(anchor => ({
                inHandle: anchor.inHandle.add(move),
                point: anchor.point.add(move),
                outHandle: anchor.outHandle.add(move)
            }));

            // TODO: Consider how to move snap vector updates out of calculator
            updateSnapVectors(newSnapVectors, this.helpers.snapVectors);
            return { anchors: newAnchors };
        };
    }

    /**
     * Conclude tracking of movement.
     */
    public endMove(): void {
        this.isMoving = false;
        updateSnapVectors([], this.helpers.snapVectors);
    }

    // TODO: Account for ctrl, alt, and snapping
    /**
     * Initialize this mutator to begin tracking vertex movement.
     * This returns a handler to be called on each subsequent mouse event.
     */
    public initVertexMove(role: VERTEX_ROLES): (event: SlideMouseEvent) => CurveMutableSerialized {
        this.isMovingVertex = true;
        const box = this.graphic.transformedBox;
        const directions = [
            box.dimensions,
            box.dimensions.signAs(V.northwest),
            box.dimensions.signAs(V.southwest),
            box.dimensions.signAs(V.southeast)
        ].map(direction => direction.rotate(box.rotation));

        // 1. Resolve the slide-relative mouse position
        // 2. Create a vector which represents how to change the respective corner
        // 3. Constrain the vector (to maintain aspect ratio) if shift is pressed
        // 4. Unrotate the corner vector to correct for graphic rotation
        // 5. Use the post-shift corner vector and corrected corner vector to update props
        const makeListener = (oppositeCorner: V): (event: SlideMouseEvent) => CurveMutableSerialized => {
            const anchorOffsets = this.graphic.anchors.map<CurveAnchor>(anchor => ({
                inHandle: oppositeCorner.towards(anchor.inHandle).abs,
                point: oppositeCorner.towards(anchor.point).abs,
                outHandle: oppositeCorner.towards(anchor.outHandle).abs
            }));

            return event => {
                const { baseEvent, slide } = event.detail;
                const position = resolvePosition(baseEvent, slide);
                const rawCornerVector = oppositeCorner.towards(position);
                const cornerVector = baseEvent.shiftKey ? rawCornerVector.projectOn(closestVector(rawCornerVector, directions)) : rawCornerVector;
                const correctedCornerVector = cornerVector.rotate(-box.rotation);

                const scale = new V(correctedCornerVector.x / box.dimensions.x, correctedCornerVector.y / box.dimensions.y);

                return {
                    anchors: anchorOffsets.map<CurveAnchor>(anchor => ({
                        inHandle: new V(anchor.inHandle.x * scale.x, anchor.inHandle.y * scale.y).add(oppositeCorner),
                        point: new V(anchor.point.x * scale.x, anchor.point.y * scale.y).add(oppositeCorner),
                        outHandle: new V(anchor.outHandle.x * scale.x, anchor.outHandle.y * scale.y).add(oppositeCorner)
                    }))
                };
            };
        };

        return ({
            [VERTEX_ROLES.TOP_LEFT]: makeListener(box.bottomRight),
            [VERTEX_ROLES.TOP_RIGHT]: makeListener(box.bottomLeft),
            [VERTEX_ROLES.BOTTOM_LEFT]: makeListener(box.topRight),
            [VERTEX_ROLES.BOTTOM_RIGHT]: makeListener(box.topLeft)
        })[role];
    }

    /**
     * Conclude tracking of vertex movement.
     */
    public endVertexMove(): void {
        this.isMovingVertex = false;
    }

    // TODO: Account for shift, alt, and snapping
    /**
     * Initialize this mutator to begin tracking anchor movement.
     * This returns a handler to be called on each subsequent mouse event.
     */
    public initAnchorMove(index: number, role: CURVE_ANCHOR_ROLES): (event: SlideMouseEvent) => CurveMutableSerialized {
        this.isMovingAnchor = true;
        const anchors = this.graphic.anchors;

        return {
            [CURVE_ANCHOR_ROLES.IN_HANDLE]: (event: SlideMouseEvent) => {
                const { baseEvent, slide } = event.detail;
                const position = resolvePosition(baseEvent, slide);

                return {
                    anchors: anchors.map((a, i) => i === index ? { ...a, inHandle: position } : a)
                };
            },
            [CURVE_ANCHOR_ROLES.POINT]: (event: SlideMouseEvent) => {
                const { baseEvent, slide } = event.detail;
                const position = resolvePosition(baseEvent, slide);
                const move = anchors[index].point.towards(position);

                return {
                    anchors: anchors.map((a, i) => i === index ? {
                        inHandle: a.inHandle.add(move),
                        point: a.point.add(move),
                        outHandle: a.outHandle.add(move)
                    } : a)
                };
            },
            [CURVE_ANCHOR_ROLES.OUT_HANDLE]: (event: SlideMouseEvent) => {
                const { baseEvent, slide } = event.detail;
                const position = resolvePosition(baseEvent, slide);

                return {
                    anchors: anchors.map((a, i) => i === index ? { ...a, outHandle: position } : a)
                };
            }
        }[role];
    }

    /**
     * Conclude tracking of anchor movement.
     */
    public endAnchorMove(): void {
        this.isMovingAnchor = false;
    }

    public setRotation(rotation: number): void {
        this.target.rotation = rotation;
        rotateBoxHelpers(this.helpers, this.target.transformedBox);
    }

    public setFillColor(fillColor: string): void {
        this.target.fillColor = fillColor;
    }

    public setStrokeColor(strokeColor: string): void {
        this.target.strokeColor = strokeColor;
    }

    public setStrokeWidth(strokeWidth: number): void {
        this.target.strokeWidth = strokeWidth;
    }

    private _repositionCurveAnchor(index: number): void {
        const anchor = this.target.getAnchor(index);
        this.anchorHelpers[index].inHandle = anchor.inHandle;
        this.anchorHelpers[index].point = anchor.point;
        this.anchorHelpers[index].outHandle = anchor.outHandle;

        resizeBoxHelpers(this.helpers, this.target.transformedBox);
    }
}

export default CurveMutator;
