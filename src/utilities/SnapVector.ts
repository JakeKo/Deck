import V from './Vector';

export default class SnapVector {
    public origin: V;
    public direction: V;

    constructor(origin: V, direction: V = V.zero) {
        this.origin = origin;
        this.direction = direction.normalized;
    }

    // Calculates the distance between the given point and the line represented by the SnapVector
    // If the SnapVector has no direction than it returns a simple point-to-point distance
    public distanceFromVector(point: V): number {
        return point.towards(this.getClosestPoint(point)).magnitude;
    }

    public getClosestPoint(point: V): V {
        return this.origin.add(this.origin.towards(point).projectOn(this.direction));
    }
}
