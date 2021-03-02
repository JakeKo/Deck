import V from './Vector';

// Returns the vector in candidates which is closest to the target vector
export function closestVector(target: V, candidates: V[]): V {
    const diffs = candidates
        .map(candidate => candidate.theta())
        .map(theta => Math.abs(theta - target.theta()));

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
