import SnapVector from "../src/models/SnapVector";
import Vector from "../src/models/Vector";

describe("SnapVector", () => {
    it("can instantiate", () => {
        // Arrange
        const snapVector = new SnapVector("", new Vector(0, 0), new Vector(1, 1));
        
        // Act

        // Assert
        expect(snapVector.origin).toEqual(new Vector(0, 0));
        expect(snapVector.direction).toEqual(new Vector(1 / Math.SQRT2, 1 / Math.SQRT2));
    });

    it("can calculate the distance from a point with no direction", () => {
        // Arrange
        const snapVector = new SnapVector("", new Vector(2, 5));
        const point = new Vector(-3, 7);
        const expectedDistance = Math.sqrt(29);

        // Act
        const actualDistance = snapVector.distanceFromVector(point);

        // Assert
        expect(actualDistance).toBe(expectedDistance);
    });

    it("can calculate the distance from a point with direction", () => {
        // Arrange
        const snapVector = new SnapVector("", new Vector(3, 8), new Vector(1, -1));
        const point = new Vector(9, 3);
        const expectedDistance = 1 / Math.SQRT2;

        // Act
        const actualDistance = snapVector.distanceFromVector(point);

        // Assert
        expect(actualDistance).toBe(expectedDistance);
    });

    it("can calculate the distance from a point along the vector", () => {
        // Arrange
        const snapVector = new SnapVector("", new Vector(3, 8), new Vector(1, -1));
        const point = new Vector(9, 2);
        const expectedDistance = 0;

        // Act
        const actualDistance = snapVector.distanceFromVector(point);

        // Assert
        expect(actualDistance).toBe(expectedDistance);
    });
});