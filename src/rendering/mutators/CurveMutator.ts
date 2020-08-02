import { closestVector } from "../../utilities/utilities";
import Vector from "../../utilities/Vector";
import { CurveRenderer } from "../graphics";
import { CurveAnchorRenderer } from "../helpers";
import SlideRenderer from "../SlideRenderer";
import { BoundingBoxMutatorHelpers, CURVE_ANCHOR_ROLES, GraphicMutator, GRAPHIC_TYPES } from "../types";
import { makeBoxHelpers, renderBoxHelpers, resizeBoxHelpers, scaleBoxHelpers, unrenderBoxHelpers } from "../utilities";

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

        this.helpers.anchors.forEach(helper => helper.render());
        renderBoxHelpers(this.helpers);
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

    // TODO: Implement rectangular scaling

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
