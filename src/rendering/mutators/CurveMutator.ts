import { closestVector } from "../../utilities/utilities";
import Vector from "../../utilities/Vector";
import { CurveRenderer } from "../graphics";
import { CurveAnchorRenderer, RectangleOutlineRenderer, VertexRenderer } from "../helpers";
import SlideRenderer from "../SlideRenderer";
import { BoundingBoxMutatorHelpers, CURVE_ANCHOR_ROLES, GraphicMutator, GRAPHIC_TYPES, VERTEX_ROLES } from "../types";

type CurveMutatorArgs = {
    target: CurveRenderer;
    slide: SlideRenderer;
    scale: number;
};

class CurveMutator implements GraphicMutator {
    public target: CurveRenderer;
    public helpers: { anchors: CurveAnchorRenderer[] } & BoundingBoxMutatorHelpers;

    constructor(args: CurveMutatorArgs) {
        this.target = args.target;

        const box = this.target.getBoundingBox();
        this.helpers = {
            anchors: this.target.getAnchors().map((anchor, index) => new CurveAnchorRenderer({
                slide: args.slide,
                scale: args.scale,
                parentId: this.target.getId(),
                index,
                ...anchor
            })),
            vertices: {
                [VERTEX_ROLES.TOP_LEFT]: new VertexRenderer({
                    slide: args.slide,
                    parent: this.target,
                    center: box.origin,
                    scale: args.scale,
                    role: VERTEX_ROLES.TOP_LEFT
                }),
                [VERTEX_ROLES.TOP_RIGHT]: new VertexRenderer({
                    slide: args.slide,
                    parent: this.target,
                    center: box.origin.add(new Vector(box.dimensions.x, 0)),
                    scale: args.scale,
                    role: VERTEX_ROLES.TOP_RIGHT
                }),
                [VERTEX_ROLES.BOTTOM_LEFT]: new VertexRenderer({
                    slide: args.slide,
                    parent: this.target,
                    center: box.origin.add(new Vector(0, box.dimensions.y)),
                    scale: args.scale,
                    role: VERTEX_ROLES.BOTTOM_LEFT
                }),
                [VERTEX_ROLES.BOTTOM_RIGHT]: new VertexRenderer({
                    slide: args.slide,
                    parent: this.target,
                    center: box.origin.add(box.dimensions),
                    scale: args.scale,
                    role: VERTEX_ROLES.BOTTOM_RIGHT
                }),
            },
            box: new RectangleOutlineRenderer({
                slide: args.slide,
                scale: args.scale,
                origin: box.origin,
                width: box.dimensions.x,
                height: box.dimensions.y
            })
        };

        this.helpers.anchors.forEach(helper => helper.render());
        Object.values(this.helpers.vertices).forEach(helper => helper.render());
        this.helpers.box.render();
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
        Object.values(this.helpers.vertices).forEach(helper => helper.unrender());
        this.helpers.box.unrender();
    }

    public setScale(scale: number): void {
        this.helpers.anchors.forEach(helper => helper.setScale(scale));
        Object.values(this.helpers.vertices).forEach(helper => helper.setScale(scale));
        this.helpers.box.setScale(scale);
    }

    private _repositionCurveAnchor(index: number): void {
        const anchor = this.target.getAnchor(index);
        this.helpers.anchors[index].setInHandle(anchor.inHandle);
        this.helpers.anchors[index].setPoint(anchor.point);
        this.helpers.anchors[index].setOutHandle(anchor.outHandle);

        const box = this.target.getBoundingBox();
        this.helpers.box.setOrigin(box.origin);
        this.helpers.box.setWidth(box.dimensions.x);
        this.helpers.box.setHeight(box.dimensions.y);
        this.helpers.vertices[VERTEX_ROLES.TOP_LEFT].setCenter(box.origin);
        this.helpers.vertices[VERTEX_ROLES.TOP_RIGHT].setCenter(box.origin.add(new Vector(box.dimensions.x, 0)));
        this.helpers.vertices[VERTEX_ROLES.BOTTOM_LEFT].setCenter(box.origin.add(new Vector(0, box.dimensions.y)));
        this.helpers.vertices[VERTEX_ROLES.BOTTOM_RIGHT].setCenter(box.origin.add(box.dimensions));
    }

    private _repositionCurveAnchors(): void {
        this.helpers.anchors.forEach((_, index) => {
            const anchor = this.target.getAnchor(index);
            this.helpers.anchors[index].setInHandle(anchor.inHandle);
            this.helpers.anchors[index].setPoint(anchor.point);
            this.helpers.anchors[index].setOutHandle(anchor.outHandle);
        });

        const box = this.target.getBoundingBox();
        this.helpers.box.setOrigin(box.origin);
        this.helpers.box.setWidth(box.dimensions.x);
        this.helpers.box.setHeight(box.dimensions.y);
        this.helpers.vertices[VERTEX_ROLES.TOP_LEFT].setCenter(box.origin);
        this.helpers.vertices[VERTEX_ROLES.TOP_RIGHT].setCenter(box.origin.add(new Vector(box.dimensions.x, 0)));
        this.helpers.vertices[VERTEX_ROLES.BOTTOM_LEFT].setCenter(box.origin.add(new Vector(0, box.dimensions.y)));
        this.helpers.vertices[VERTEX_ROLES.BOTTOM_RIGHT].setCenter(box.origin.add(box.dimensions));
    }
}

export default CurveMutator;
