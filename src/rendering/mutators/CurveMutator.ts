import { closestVector } from "../../utilities/utilities";
import Vector from "../../utilities/Vector";
import { CurveRenderer } from "../graphics";
import { CurveAnchorRenderer, RectangleOutlineRenderer } from "../helpers";
import SlideRenderer from "../SlideRenderer";
import { GraphicMutator, GRAPHIC_TYPES, CURVE_ANCHOR_ROLES, BoundingBox } from "../types";

type CurveMutatorArgs = {
    target: CurveRenderer;
    slide: SlideRenderer;
    scale: number;
};

class CurveMutator implements GraphicMutator {
    private _target: CurveRenderer;
    private _slide: SlideRenderer;
    private _helpers: {
        anchors: CurveAnchorRenderer[];
        box: RectangleOutlineRenderer;
    };

    constructor(args: CurveMutatorArgs) {
        this._target = args.target;
        this._slide = args.slide;
        this._helpers = {
            anchors: this._target.getAnchors().map((anchor, index) => new CurveAnchorRenderer({
                slide: this._slide,
                scale: args.scale,
                parentId: this._target.getId(),
                index,
                ...anchor
            })),
            box: new RectangleOutlineRenderer({
                slide: this._slide,
                scale: args.scale,
                origin: this._target.getBoundingBox().origin,
                width: this._target.getBoundingBox().dimensions.x,
                height: this._target.getBoundingBox().dimensions.y
            })
        };

        this._helpers.anchors.forEach(helper => helper.render());
        this._helpers.box.render();
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
        this._helpers.anchors.forEach(helper => helper.unrender());
        this._helpers.box.unrender();
    }

    public setScale(scale: number): void {
        this._helpers.anchors.forEach(helper => helper.setScale(scale));
        this._helpers.box.setScale(scale);
    }

    private _repositionCurveAnchor(index: number): void {
        const anchor = this._target.getAnchor(index);
        this._helpers.anchors[index].setInHandle(anchor.inHandle);
        this._helpers.anchors[index].setPoint(anchor.point);
        this._helpers.anchors[index].setOutHandle(anchor.outHandle);

        const boundingBox = this._target.getBoundingBox();
        this._helpers.box.setOrigin(boundingBox.origin);
        this._helpers.box.setWidth(boundingBox.dimensions.x);
        this._helpers.box.setHeight(boundingBox.dimensions.y);
    }

    private _repositionCurveAnchors(): void {
        this._helpers.anchors.forEach((_, index) => this._repositionCurveAnchor(index));

        const boundingBox = this._target.getBoundingBox();
        this._helpers.box.setOrigin(boundingBox.origin);
        this._helpers.box.setWidth(boundingBox.dimensions.x);
        this._helpers.box.setHeight(boundingBox.dimensions.y);
    }
}

export default CurveMutator;
