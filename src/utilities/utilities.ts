import Vector from "./Vector";

// Returns the vector in candidates which is closest to the target vector
export function closestVector(target: Vector, candidates: Vector[]): Vector {
    const diffs = candidates.map(candidate => target.theta(candidate));
    const minDiff = Math.min(...diffs);
    const minDiffIndex = diffs.indexOf(minDiff);
    return candidates[minDiffIndex];
}

export function mod(n: number, m: number): number {
    return ((n % m) + m) % m;
}
