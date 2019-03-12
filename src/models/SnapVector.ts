import Vector from "./Vector";

export default class SnapVector {
    public origin: Vector;
    public direction?: Vector;

    constructor(origin: Vector, direction?: Vector) {
        this.origin = origin;
        this.direction = direction;
    }

    public distanceFromVector(point: Vector): number {
        return 0;
    }
}