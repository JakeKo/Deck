export default class Vector {
    public x: number;
    public y: number;

    public static undefined: Vector = new Vector(NaN, NaN);
    public static zero = new Vector(0, 0);
    public static up = new Vector(0, 1);
    public static right = new Vector(1, 0);
    public static down = new Vector(0, -1);
    public static left = new Vector(-1, 0);

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    get magnitude(): number {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }

    get normalized(): Vector {
        return this.magnitude === 0 ? Vector.zero : new Vector(this.x / this.magnitude, this.y / this.magnitude);
    }

    public toArray(): Array<number> {
        return [this.x, this.y];
    }

    public add(point: Vector): Vector {
        return new Vector(this.x + point.x, this.y + point.y);
    }

    public scale(scalar: number): Vector {
        return new Vector(scalar * this.x, scalar * this.y);
    }

    public reflect(origin: Vector = this): Vector {
        return origin.scale(2).add(this.scale(-1));
    }

    public transform(transformation: (coordinate: number) => number) {
        return new Vector(transformation(this.x), transformation(this.y));
    }

    public equals(vector: Vector): boolean {
        return this.x === vector.x && this.y === vector.y;
    }
}
