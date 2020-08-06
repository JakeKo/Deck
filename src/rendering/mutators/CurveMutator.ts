import { SlideMouseEvent } from "../../events/types";
import { resolvePosition } from "../../tools/utilities";
import { closestVector, mod } from "../../utilities/utilities";
import Vector from "../../utilities/Vector";
import { CurveRenderer } from "../graphics";
import { CurveAnchorRenderer } from "../helpers";
import SlideRenderer from "../SlideRenderer";
import { BoundingBoxMutatorHelpers, CurveAnchor, CURVE_ANCHOR_ROLES, GraphicMutator, GRAPHIC_TYPES, VERTEX_ROLES } from "../types";
import { makeBoxHelpers, renderBoxHelpers, resizeBoxHelpers, rotateBoxHelpers, scaleBoxHelpers, unrenderBoxHelpers } from "../utilities";

type CurveMutatorArgs = {
    target: CurveRenderer;
    slide: SlideRenderer;
    scale: number;
};

class CurveMutator implements GraphicMutator {
    public target: CurveRenderer;
    public helpers: {
        anchors: CurveAnchorRenderer[];
    } & BoundingBoxMutatorHelpers;

    constructor(args: CurveMutatorArgs) {
        this.target = args.target;

        const box = this.target.getBoundingBox();
        this.helpers = {
            ...makeBoxHelpers(this.target, args.slide, args.scale),
            anchors: this.target.getAnchors().map((anchor, index) => new CurveAnchorRenderer({
                slide: args.slide,
                scale: args.scale,
                parentId: this.target.getId(),
                index,
                ...anchor
            }))
        };

        renderBoxHelpers(this.helpers);
        this.helpers.anchors.forEach(helper => helper.render());
    }

    public getType(): GRAPHIC_TYPES {
        return GRAPHIC_TYPES.CURVE;
    }

    public getTarget(): CurveRenderer {
        return this.target;
    }

    public getOrigin(): Vector {
        return this.target.getAnchor(0).point;
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
            const anchorOffsets = this.target.getAnchors().map<CurveAnchor>(anchor => ({
                inHandle: oppositeCorner.towards(anchor.inHandle).abs,
                point: oppositeCorner.towards(anchor.point).abs,
                outHandle: oppositeCorner.towards(anchor.outHandle).abs,
            }));

            return event => {
                const { baseEvent, slide } = event.detail;
                const position = resolvePosition(baseEvent, slide);
                const rawOffset = oppositeCorner.towards(position);
                const offset = baseEvent.shiftKey ? rawOffset.projectOn(closestVector(rawOffset, directions)) : rawOffset;

                const scale = new Vector(offset.x / box.dimensions.x, offset.y / box.dimensions.y);

                // Update rendering
                this.target.setAnchors(anchorOffsets.map<CurveAnchor>(anchor => ({
                    inHandle: new Vector(anchor.inHandle.x * scale.x, anchor.inHandle.y * scale.y).add(oppositeCorner),
                    point: new Vector(anchor.point.x * scale.x, anchor.point.y * scale.y).add(oppositeCorner),
                    outHandle: new Vector(anchor.outHandle.x * scale.x, anchor.outHandle.y * scale.y).add(oppositeCorner)
                })));
                this._repositionCurveAnchors();
            };
        };

        return {
            [VERTEX_ROLES.TOP_LEFT]: makeListener(box.bottomRight),
            [VERTEX_ROLES.TOP_RIGHT]: makeListener(box.bottomLeft),
            [VERTEX_ROLES.BOTTOM_LEFT]: makeListener(box.topRight),
            [VERTEX_ROLES.BOTTOM_RIGHT]: makeListener(box.topLeft)
        };
    }

    public get rotateListener(): (event: SlideMouseEvent) => void {
        const { center } = this.target.getBoundingBox();
        const directions = [...Vector.cardinals, ...Vector.intermediates];

        return event => {
            const { slide, baseEvent } = event.detail;
            const position = resolvePosition(baseEvent, slide);
            const rawOffset = center.towards(position);
            const offset = baseEvent.shiftKey ? closestVector(rawOffset, directions) : rawOffset;
            const theta = Math.atan2(offset.y, offset.x);

            this.target.setRotation(mod(theta, Math.PI * 2));
            rotateBoxHelpers(this.helpers, this.target.getBoundingBox());
        };
    }

    // TODO: Account for alt and snapping
    // TODO: Extract shift operations to utilities
    public graphicMoveHandler(): (position: Vector, shift: boolean, alt: boolean) => void {
        const initialOrigin = this.getOrigin();
        const initialAnchors = this.target.getAnchors();
        const directions = [Vector.east, Vector.northeast, Vector.north, Vector.northwest, Vector.west, Vector.southwest, Vector.south, Vector.southeast];

        return (position, shift, alt) => {
            const rawMove = initialOrigin.towards(position);
            const moveDirection = (shift ? closestVector(rawMove, directions) : rawMove).normalized;
            const move = rawMove.projectOn(moveDirection);

            const newAnchors = initialAnchors.map(anchor => ({
                inHandle: anchor.inHandle.add(move),
                point: anchor.point.add(move),
                outHandle: anchor.outHandle.add(move)
            }));
            this.target.setAnchors(newAnchors);
            this._repositionCurveAnchors();
        };
    }

    // TODO: Account for shift, alt, and snapping
    public getAnchorHandler(index: number, role: CURVE_ANCHOR_ROLES): (position: Vector) => void {
        const anchor = this.target.getAnchor(index);
        return ({
            [CURVE_ANCHOR_ROLES.IN_HANDLE]: (position: Vector): void => {
                this.target.setAnchor(index, { ...anchor, inHandle: position });
                this._repositionCurveAnchor(index);
            },
            [CURVE_ANCHOR_ROLES.POINT]: (position: Vector): void => {
                const move = anchor.point.towards(position);
                this.target.setAnchor(index, {
                    inHandle: anchor.inHandle.add(move),
                    point: anchor.point.add(move),
                    outHandle: anchor.outHandle.add(move),
                });
                this._repositionCurveAnchor(index);
            },
            [CURVE_ANCHOR_ROLES.OUT_HANDLE]: (position: Vector): void => {
                this.target.setAnchor(index, { ...anchor, outHandle: position });
                this._repositionCurveAnchor(index);
            }
        } as { [key in CURVE_ANCHOR_ROLES]: (position: Vector) => void })[role];
    }

    public complete(): void {
        this.helpers.anchors.forEach(helper => helper.unrender());
        unrenderBoxHelpers(this.helpers);
    }

    public setScale(scale: number): void {
        this.helpers.anchors.forEach(helper => helper.setScale(scale));
        scaleBoxHelpers(this.helpers, scale);
    }

    private _repositionCurveAnchor(index: number): void {
        const anchor = this.target.getAnchor(index);
        this.helpers.anchors[index].setInHandle(anchor.inHandle);
        this.helpers.anchors[index].setPoint(anchor.point);
        this.helpers.anchors[index].setOutHandle(anchor.outHandle);

        resizeBoxHelpers(this.helpers, this.target.getBoundingBox());
    }

    private _repositionCurveAnchors(): void {
        this.helpers.anchors.forEach((_, index) => {
            const anchor = this.target.getAnchor(index);
            this.helpers.anchors[index].setInHandle(anchor.inHandle);
            this.helpers.anchors[index].setPoint(anchor.point);
            this.helpers.anchors[index].setOutHandle(anchor.outHandle);
        });

        resizeBoxHelpers(this.helpers, this.target.getBoundingBox());
    }
}

export default CurveMutator;
