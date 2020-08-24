import Vector from '@/utilities/Vector';

export function closeEnough(a: number, b: number, delta: number): boolean {
    return Math.abs(a - b) < delta;
}

export function vectorsCloseEnough(v1: Vector, v2: Vector, delta: number): boolean {
    return closeEnough(v1.x, v2.x, delta) && closeEnough(v1.y, v2.y, delta);
}
