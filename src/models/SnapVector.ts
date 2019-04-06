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
        return point.towards(this.getClosestPoint(point)).magnitude;
    }

    public getClosestPoint(point: Vector): Vector {
        return this.origin.add(this.origin.towards(point).projectOn(this.direction));
    }
}
