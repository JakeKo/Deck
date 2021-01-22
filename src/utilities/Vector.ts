import { mod } from './utilities';

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
    public static cardinals = [Vector.north, Vector.east, Vector.south, Vector.west];
    public static intermediates = [Vector.northeast, Vector.southeast, Vector.southwest, Vector.northwest];

    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public get magnitude(): number {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }

    public get normalized(): Vector {
        return this.magnitude === 0 ? Vector.zero : new Vector(this.x / this.magnitude, this.y / this.magnitude);
    }

    public get array(): Array<number> {
        return [this.x, this.y];
    }

    public get abs(): Vector {
        return this.transform(Math.abs);
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
        const thisTheta = mod(Math.atan2(this.y, this.x), Math.PI * 2);
        const otherTheta = mod(Math.atan2(vector.y, vector.x), Math.PI * 2);
        return mod(thisTheta - otherTheta, Math.PI * 2);
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
        return new Vector(Math.sign(sign.x) * Math.abs(this.x), Math.sign(sign.y) * Math.abs(this.y));
    }

    public rotate(theta: number): Vector {
        return new Vector(this.magnitude * Math.cos(theta), this.magnitude * Math.sin(theta));
    }

    public rotateMore(theta: number): Vector {
        return this.rotate(mod(this.theta(Vector.east) + theta, Math.PI * 2));
    }

    public isPerpendicular(vector: Vector, epsilon = 0): boolean {
        return this.dot(vector) <= epsilon;
    }

    public isParallel(vector: Vector, epsilon = 0): boolean {
        const slope = vector.normalized;
        const inverseSlope = slope.scale(-1);
        return (Math.abs(this.normalized.x - slope.x) <= epsilon && Math.abs(this.normalized.y - slope.y) <= epsilon) ||
            (Math.abs(this.normalized.x - inverseSlope.x) <= epsilon && Math.abs(this.normalized.y - inverseSlope.y) <= epsilon);
    }
}
