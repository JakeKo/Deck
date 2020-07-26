import { closestVector } from "../../utilities/utilities";
import Vector from "../../utilities/Vector";
import { CurveRenderer } from "../graphics";
import { CurveAnchorRenderer } from "../helpers";
import SlideRenderer from "../SlideRenderer";
import { GraphicMutator, GRAPHIC_TYPES, CURVE_ANCHOR_ROLES } from "../types";

type CurveMutatorArgs = {
    target: CurveRenderer;
    slide: SlideRenderer;
    scale: number;
};

class CurveMutator implements GraphicMutator {
    private _target: CurveRenderer;
    private _slide: SlideRenderer;
    private _helpers: CurveAnchorRenderer[];

    constructor(args: CurveMutatorArgs) {
        this._target = args.target;
        this._slide = args.slide;
        this._helpers = this._target.getAnchors().map((anchor, index) => new CurveAnchorRenderer({
            slide: this._slide,
            scale: args.scale,
            parentId: this._target.getId(),
            index,
            ...anchor
        }));

        this._helpers.forEach(helper => helper.render());
    }

    public getType(): GRAPHIC_TYPES {
        return GRAPHIC_TYPES.CURVE;
    }

    public getTarget(): CurveRenderer {
        return this._target;
    }

    public getOrigin(): Vector {
        return this._target.getAnchor(0).point;
    }

    // TODO: Account for alt and snapping
    // TODO: Extract shift operations to utilities
    public graphicMoveHandler(): (position: Vector, shift: boolean, alt: boolean) => void {
        const initialOrigin = this.getOrigin();
        const initialAnchors = this._target.getAnchors();
        const directions = [Vector.right, new Vector(1, 1), Vector.up, new Vector(-1, 1), Vector.left, new Vector(-1, -1), Vector.down, new Vector(1, -1)];

        return (position, shift, alt) => {
            const rawMove = initialOrigin.towards(position);
            const moveDirection = (shift ? closestVector(rawMove, directions) : rawMove).normalized;
            const move = rawMove.projectOn(moveDirection);

            const newAnchors = initialAnchors.map(anchor => ({
                inHandle: anchor.inHandle.add(move),
                point: anchor.point.add(move),
                outHandle: anchor.outHandle.add(move)
            }));
            this._target.setAnchors(newAnchors);
            this._repositionCurveAnchors();
        };
    }

    // TODO: Account for shift, alt, and snapping
    public getAnchorHandler(index: number, role: CURVE_ANCHOR_ROLES): (position: Vector) => void {
        const anchor = this._target.getAnchor(index);
        return ({
            [CURVE_ANCHOR_ROLES.IN_HANDLE]: (position: Vector): void => {
                this._target.setAnchor(index, { ...anchor, inHandle: position });
                this._repositionCurveAnchor(index);
            },
            [CURVE_ANCHOR_ROLES.POINT]: (position: Vector): void => {
                const move = anchor.point.towards(position);
                this._target.setAnchor(index, {
                    inHandle: anchor.inHandle.add(move),
                    point: anchor.point.add(move),
                    outHandle: anchor.outHandle.add(move),
                });
                this._repositionCurveAnchor(index);
            },
            [CURVE_ANCHOR_ROLES.OUT_HANDLE]: (position: Vector): void => {
                this._target.setAnchor(index, { ...anchor, outHandle: position });
                this._repositionCurveAnchor(index);
            }
        } as { [key in CURVE_ANCHOR_ROLES]: (position: Vector) => void })[role];
    }

    // TODO: Implement rectangular scaling

    public complete(): void {
        this._helpers.forEach(helper => helper.unrender());
    }

    public setScale(scale: number): void {
        this._helpers.forEach(helper => helper.setScale(scale));
    }

    private _repositionCurveAnchor(index: number): void {
        const anchor = this._target.getAnchor(index);
        this._helpers[index].setInHandle(anchor.inHandle);
        this._helpers[index].setPoint(anchor.point);
        this._helpers[index].setOutHandle(anchor.outHandle);
    }

    private _repositionCurveAnchors(): void {
        this._helpers.forEach((_, index) => this._repositionCurveAnchor(index));
    }
}

export default CurveMutator;
