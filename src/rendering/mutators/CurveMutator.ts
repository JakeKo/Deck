import { SlideMouseEvent } from '@/events/types';
import { resolvePosition } from '@/tools/utilities';
import { CurveMutableSerialized } from '@/types';
import { closestVector, mod } from '@/utilities/utilities';
import V from '@/utilities/Vector';
import { CurveAnchorRenderer } from '../helpers';
import {
    BoundingBoxMutatorHelpers,
    CurveAnchor,
    CURVE_ANCHOR_ROLES,
    GRAPHIC_TYPES,
    ICurveMutator,
    ICurveRenderer,
    ISlideRenderer,
    VERTEX_ROLES
} from '../types';
import {
    calculateMove,
    makeBoxHelpers,
    renderBoxHelpers,
    resizeBoxHelpers,
    rotateBoxHelpers,
    scaleBoxHelpers,
    unrenderBoxHelpers
} from '../utilities';

class CurveMutator implements ICurveMutator {
    public readonly type = GRAPHIC_TYPES.CURVE;
    public readonly target: ICurveRenderer;

    private _helpers: BoundingBoxMutatorHelpers & { anchors: CurveAnchorRenderer[] };
    private _graphicId: string;
    private _slide: ISlideRenderer;

    constructor({
        target,
        slide,
        scale,
        graphicId
    }: {
        target: ICurveRenderer;
        slide: ISlideRenderer;
        scale: number;
        graphicId: string;
    }) {
        this.target = target;
        this._graphicId = graphicId;
        this._slide = slide;

        this._helpers = {
            ...makeBoxHelpers(this.target, this._slide, scale),
            anchors: this.target.anchors.map((anchor, index) => new CurveAnchorRenderer({
                slide: this._slide,
                scale,
                parentId: this._graphicId,
                index,
                ...anchor
            }))
        };

        renderBoxHelpers(this._helpers);
        this._helpers.anchors.forEach(helper => helper.render());
    }

    public set scale(scale: number) {
        this._helpers.anchors.forEach(helper => (helper.scale = scale));
        scaleBoxHelpers(this._helpers, scale);
    }

    // TODO: Account for ctrl, alt, and snapping
    public vertexListener(role: VERTEX_ROLES): (event: SlideMouseEvent) => CurveMutableSerialized {
        const box = this.target.transformedBox;
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
            const anchorOffsets = this.target.anchors.map<CurveAnchor>(anchor => ({
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

                // Update rendering
                this.target.anchors = anchorOffsets.map<CurveAnchor>(anchor => ({
                    inHandle: new V(anchor.inHandle.x * scale.x, anchor.inHandle.y * scale.y).add(oppositeCorner),
                    point: new V(anchor.point.x * scale.x, anchor.point.y * scale.y).add(oppositeCorner),
                    outHandle: new V(anchor.outHandle.x * scale.x, anchor.outHandle.y * scale.y).add(oppositeCorner)
                }));
                this._repositionCurveAnchors();

                return { anchors: this.target.anchors };
            };
        };

        return ({
            [VERTEX_ROLES.TOP_LEFT]: makeListener(box.bottomRight),
            [VERTEX_ROLES.TOP_RIGHT]: makeListener(box.bottomLeft),
            [VERTEX_ROLES.BOTTOM_LEFT]: makeListener(box.topRight),
            [VERTEX_ROLES.BOTTOM_RIGHT]: makeListener(box.topLeft)
        })[role];
    }

    public rotateListener(): (event: SlideMouseEvent) => CurveMutableSerialized {
        const { center } = this.target.transformedBox;
        const directions = [...V.cardinals, ...V.intermediates];

        return event => {
            const { slide, baseEvent } = event.detail;
            const position = resolvePosition(baseEvent, slide);
            const rawOffset = center.towards(position);
            const offset = baseEvent.shiftKey ? closestVector(rawOffset, directions) : rawOffset;
            const theta = Math.atan2(offset.y, offset.x);

            this.target.rotation = mod(theta, Math.PI * 2);
            rotateBoxHelpers(this._helpers, this.target.transformedBox);

            return { rotation: this.target.rotation };
        };
    }

    public moveListener(initialPosition: V): (event: SlideMouseEvent) => CurveMutableSerialized {
        const initialOrigin = this.target.getAnchor(0).point;
        const initialAnchors = this.target.anchors;
        const relativePullPoints = this.target.pullPoints.map(p => initialPosition.towards(p));
        const snapVectors = this._slide.getSnapVectors([this._graphicId]);

        return event => {
            const move = calculateMove({
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
            this.target.anchors = newAnchors;
            this._repositionCurveAnchors();

            return { anchors: this.target.anchors };
        };
    }

    // TODO: Account for shift, alt, and snapping
    public anchorListener(index: number, role: CURVE_ANCHOR_ROLES): (event: SlideMouseEvent) => CurveMutableSerialized {
        const anchor = this.target.getAnchor(index);
        return {
            [CURVE_ANCHOR_ROLES.IN_HANDLE]: (event: SlideMouseEvent): CurveMutableSerialized => {
                const { baseEvent, slide } = event.detail;
                const position = resolvePosition(baseEvent, slide);
                this.target.setAnchor(index, { ...anchor, inHandle: position });
                this._repositionCurveAnchor(index);

                return { anchors: this.target.anchors };
            },
            [CURVE_ANCHOR_ROLES.POINT]: (event: SlideMouseEvent): CurveMutableSerialized => {
                const { baseEvent, slide } = event.detail;
                const position = resolvePosition(baseEvent, slide);
                const move = anchor.point.towards(position);
                this.target.setAnchor(index, {
                    inHandle: anchor.inHandle.add(move),
                    point: anchor.point.add(move),
                    outHandle: anchor.outHandle.add(move)
                });
                this._repositionCurveAnchor(index);

                return { anchors: this.target.anchors };
            },
            [CURVE_ANCHOR_ROLES.OUT_HANDLE]: (event: SlideMouseEvent): CurveMutableSerialized => {
                const { baseEvent, slide } = event.detail;
                const position = resolvePosition(baseEvent, slide);
                this.target.setAnchor(index, { ...anchor, outHandle: position });
                this._repositionCurveAnchor(index);

                return { anchors: this.target.anchors };
            }
        }[role];
    }

    public setRotation(rotation: number): void {
        this.target.rotation = rotation;
        rotateBoxHelpers(this._helpers, this.target.transformedBox);
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

    public complete(): void {
        this._helpers.anchors.forEach(helper => helper.unrender());
        unrenderBoxHelpers(this._helpers);
    }

    private _repositionCurveAnchor(index: number): void {
        const anchor = this.target.getAnchor(index);
        this._helpers.anchors[index].inHandle = anchor.inHandle;
        this._helpers.anchors[index].point = anchor.point;
        this._helpers.anchors[index].outHandle = anchor.outHandle;

        resizeBoxHelpers(this._helpers, this.target.transformedBox);
    }

    private _repositionCurveAnchors(): void {
        this._helpers.anchors.forEach((_, index) => {
            const anchor = this.target.getAnchor(index);
            this._helpers.anchors[index].inHandle = anchor.inHandle;
            this._helpers.anchors[index].point = anchor.point;
            this._helpers.anchors[index].outHandle = anchor.outHandle;
        });

        resizeBoxHelpers(this._helpers, this.target.transformedBox);
    }
}

export default CurveMutator;
