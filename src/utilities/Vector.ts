export default class Vector {
    public static undefined: Vector = new Vector(NaN, NaN);
    public static zero = new Vector(0, 0);
    public static north = new Vector(0, 1);
    public static northeast = new Vector(Math.SQRT2 / 2, Math.SQRT2 / 2);
    public static east = new Vector(1, 0);
    public static southeast = new Vector(Math.SQRT2 / 2, -Math.SQRT2 / 2);
    public static south = new Vector(0, -1);
    public static southwest = new Vector(-Math.SQRT2 / 2, -Math.SQRT2 / 2);
    public static west = new Vector(-1, 0);
    public static northwest = new Vector(-Math.SQRT2 / 2, Math.SQRT2 / 2);

    public x: number;
    public y: number;

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

    get array(): Array<number> {
        return [this.x, this.y];
    }

    get abs(): Vector {
        return this.transform(Math.abs);
    }

    public toArray(): Array<number> {
        return [this.x, this.y];
    }

    public add(vector: Vector): Vector {
        return new Vector(this.x + vector.x, this.y + vector.y);
    }

    public towards(vector: Vector): Vector {
        return vector.add(this.scale(-1));
    }

    public dot(vector: Vector): number {
        return this.x * vector.x + this.y * vector.y;
    }

    public theta(vector: Vector): number {
        return Math.acos(this.dot(vector) / (this.magnitude * vector.magnitude));
    }

    public projectOn(vector: Vector): Vector {
        return vector.normalized.scale(this.dot(vector.normalized));
    }

    public scale(scalar: number): Vector {
        return new Vector(scalar * this.x, scalar * this.y);
    }

    public reflect(origin: Vector = this): Vector {
        return origin.add(origin.towards(this).scale(-1));
    }

    public transform(transformation: (coordinate: number) => number) {
        return new Vector(transformation(this.x), transformation(this.y));
    }

    public equals(vector: Vector): boolean {
        return this.x === vector.x && this.y === vector.y;
    }

    public signAs(sign: Vector): Vector {
        return new Vector(Math.sign(sign.x) * this.x, Math.sign(sign.y) * this.y);
    }
}
