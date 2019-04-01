import Vector from "./Vector";

export default class SnapVector {
    public graphicId: string;
    public origin: Vector;
    public direction: Vector;

    constructor(graphicId: string, origin: Vector, direction: Vector = Vector.zero) {
        this.graphicId = graphicId;
        this.origin = origin;
        this.direction = direction.normalized;
    }

    // Calculates the distance between the given point and the line represented by the SnapVector
    // If the SnapVector has no direction than it returns a simple point-to-point distance
    public distanceFromVector(point: Vector): number {
        const difference: Vector = point.add(this.origin.scale(-1));

        if (this.direction.equals(Vector.zero)) {
            return difference.magnitude;
        }

        if (this.direction.equals(Vector.up) || this.direction.equals(Vector.down)) {
            return Math.abs(this.origin.x - point.x);
        }

        const standardForm: Vector = new Vector(-this.direction.y / this.direction.x, 1);
        return Math.abs(standardForm.x * difference.x + standardForm.y * difference.y) / standardForm.magnitude;
    }
}
