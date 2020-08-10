export function closeEnough(a, b, epsilon) {
    return Math.abs(a - b) < epsilon;
}

export function vectorsCloseEnough(v1, v2, epsilon) {
    return closeEnough(v1.x, v2.x, epsilon) && closeEnough(v1.y, v2.y, epsilon);
}
