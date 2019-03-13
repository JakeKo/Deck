import Vector from "./Vector";

export default class SnapVector {
    public origin: Vector;
    public direction?: Vector;

    constructor(origin: Vector, direction?: Vector) {
        this.origin = origin;
        this.direction = direction === undefined ? undefined : direction.normalized;
    }

    public distanceFromVector(point: Vector): number {
        const difference: Vector = point.add(this.origin.scale(-1));

        if (this.direction === undefined) {
            return difference.magnitude;
        }

        const standardForm: Vector = new Vector(-this.direction.y / this.direction.x, 1);
        return Math.abs(standardForm.x * difference.x + standardForm.y * difference.y) / standardForm.magnitude;
    }
}
