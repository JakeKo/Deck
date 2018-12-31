export default class Point {
    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public toArray(): Array<number> {
        return [this.x, this.y];
    }

    public add(point: Point): Point {
        return new Point(this.x + point.x, this.y + point.y);
    }

    public scale(scalar: number): Point {
        return new Point(scalar * this.x, scalar * this.y);
    }

    public reflect(origin: Point = this): Point {
        return origin.scale(2).add(this.scale(-1));
    }

    public transform(transformation: (coordinate: number) => number) {
        return new Point(transformation(this.x), transformation(this.y));
    }
}
