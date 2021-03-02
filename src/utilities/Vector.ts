import { mod } from './utilities';

export default class V {
    public static undefined: V = new V(NaN, NaN);
    public static zero = new V(0, 0);
    public static north = new V(0, 1);
    public static northeast = new V(Math.SQRT2 / 2, Math.SQRT2 / 2);
    public static east = new V(1, 0);
    public static southeast = new V(Math.SQRT2 / 2, -Math.SQRT2 / 2);
    public static south = new V(0, -1);
    public static southwest = new V(-Math.SQRT2 / 2, -Math.SQRT2 / 2);
    public static west = new V(-1, 0);
    public static northwest = new V(-Math.SQRT2 / 2, Math.SQRT2 / 2);
    public static cardinals = [V.north, V.east, V.south, V.west];
    public static intermediates = [V.northeast, V.southeast, V.southwest, V.northwest];

    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public get magnitude(): number {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }

    public get normalized(): V {
        return this.magnitude === 0 ? V.zero : this.scale(1 / this.magnitude);
    }

    public get array(): Array<number> {
        return [this.x, this.y];
    }

    public get abs(): V {
        return this.apply(Math.abs);
    }

    public get neg(): V {
        return this.scale(-1);
    }

    public add(vector: V): V {
        return new V(this.x + vector.x, this.y + vector.y);
    }

    public addX(x: number): V {
        return this.add(new V(x, 0));
    }

    public addY(y: number): V {
        return this.add(new V(0, y));
    }

    public towards(vector: V): V {
        return vector.add(this.neg);
    }

    public dot(vector: V): number {
        return this.x * vector.x + this.y * vector.y;
    }

    /**
     * Calculates the angle of this vector off of the provided vector - defaults to (1, 0)
     */
    public theta(vector: V = V.east): number {
        const thisTheta = Math.atan2(this.y, this.x);
        const otherTheta = Math.atan2(vector.y, vector.x);
        return mod(thisTheta - otherTheta, Math.PI * 2);
    }

    public projectOn(vector: V): V {
        return vector.normalized.scale(this.dot(vector.normalized));
    }

    public scale(scalar: number): V {
        return new V(scalar * this.x, scalar * this.y);
    }

    public reflect(origin: V = this): V {
        return origin.add(origin.towards(this).neg);
    }

    public apply(f: (coordinate: number) => number) {
        return new V(f(this.x), f(this.y));
    }

    public equals(vector: V): boolean {
        return this.x === vector.x && this.y === vector.y;
    }

    public signAs(sign: V): V {
        return new V(Math.sign(sign.x) * Math.abs(this.x), Math.sign(sign.y) * Math.abs(this.y));
    }

    /**
     * Rotates this vector by the provided angle (in radians) about (0, 0)
     */
    public rotate(theta: number): V {
        const newTheta = mod(this.theta() + theta, Math.PI * 2);
        return new V(Math.cos(newTheta), Math.sin(newTheta)).scale(this.magnitude);
    }

    public isPerpendicular(vector: V, epsilon = 0): boolean {
        return this.dot(vector) <= epsilon;
    }

    public isParallel(vector: V, epsilon = 0): boolean {
        const slope = vector.normalized;
        const inverseSlope = slope.neg;
        return (this.x === 0 && this.y === 0) ||
            (vector.x === 0 && vector.y === 0) ||
            (Math.abs(this.normalized.x - slope.x) <= epsilon && Math.abs(this.normalized.y - slope.y) <= epsilon) ||
            (Math.abs(this.normalized.x - inverseSlope.x) <= epsilon && Math.abs(this.normalized.y - inverseSlope.y) <= epsilon);
    }
}
