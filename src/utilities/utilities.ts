import Vector from "./Vector";

// Returns the vector in candidates which is closest to the target vector
export function closestVector(target: Vector, candidates: Vector[]): Vector {
    const diffs = candidates
        .map(candidate => candidate.theta(Vector.east))
        .map(theta => Math.abs(theta - target.theta(Vector.east)));

    const minDiff = Math.min(...diffs);
    const minDiffIndex = diffs.indexOf(minDiff);
    return candidates[minDiffIndex];
}

export function mod(n: number, m: number): number {
    return ((n % m) + m) % m;
}

export function radToDeg(radians: number): number {
    return radians * 180 / Math.PI;
}

export function degToRad(degrees: number): number {
    return degrees * Math.PI / 180;
}
