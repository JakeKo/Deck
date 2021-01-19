import SnapVector from '../SnapVector';
import Vector from '../Vector';

describe('SnapVector', () => {
    it('can instantiate with reasonable defaults', () => {
        // Arrange
        const snapVector = new SnapVector(new Vector(0, 0), new Vector(1, 1));

        // Act

        // Assert
        expect(snapVector.origin).toEqual(new Vector(0, 0));
        expect(snapVector.direction).toEqual(new Vector(1 / Math.SQRT2, 1 / Math.SQRT2));
    });

    it('can calculate the distance from a point with no direction', () => {
        // Arrange
        const snapVector = new SnapVector(new Vector(2, 5));
        const point = new Vector(-3, 7);
        const expectedDistance = Math.sqrt(29);

        // Act
        const actualDistance = snapVector.distanceFromVector(point);

        // Assert
        expect(actualDistance).toBe(expectedDistance);
    });

    it('can calculate the distance from a point with direction', () => {
        // Arrange
        const snapVector = new SnapVector(new Vector(3, 8), Vector.southeast);
        const point = new Vector(9, 3);
        const expectedDistance = 1 / Math.sqrt(2);

        // Act
        const actualDistance = snapVector.distanceFromVector(point);

        // Assert
        expect(actualDistance).toBeCloseTo(expectedDistance, 5);
    });

    it('can calculate the distance from a point on the direction vector', () => {
        // Arrange
        const snapVector = new SnapVector(new Vector(3, 8), Vector.southeast);
        const point = new Vector(9, 2);
        const expectedDistance = 0;

        // Act
        const actualDistance = snapVector.distanceFromVector(point);

        // Assert
        expect(actualDistance).toBeCloseTo(expectedDistance, 5);
    });

    it('can calculate the distance from a point with a vertical direction', () => {
        // Arrange
        const snapVector = new SnapVector(new Vector(0, 0), Vector.north);
        const point = new Vector(1, 1);
        const expectedDistance = 1;

        // Act
        const actualDistance = snapVector.distanceFromVector(point);

        // Assert
        expect(actualDistance).toBe(expectedDistance);
    });

    it('can calculate the distance from a point with a horizontal direction', () => {
        // Arrange
        const snapVector = new SnapVector(new Vector(0, 0), Vector.east);
        const point = new Vector(1, 1);
        const expectedDistance = 1;

        // Act
        const actualDistance = snapVector.distanceFromVector(point);

        // Assert
        expect(actualDistance).toBe(expectedDistance);
    });

    it('can calculate the closest point from a point with no direction', () => {
        // Arrange
        const snapVector = new SnapVector(new Vector(2, 5));
        const point = new Vector(-3, 7);
        const expected = new Vector(2, 5);

        // Act
        const actual = snapVector.getClosestPoint(point);

        // Assert
        expect(actual.x).toBeCloseTo(expected.x, 5);
        expect(actual.y).toBeCloseTo(expected.y, 5);
    });

    it('can calculate the closest point from a point with direction', () => {
        // Arrange
        const snapVector = new SnapVector(new Vector(3, 8), Vector.southeast);
        const point = new Vector(9, 3);
        const expected = new Vector(8.5, 2.5);

        // Act
        const actual = snapVector.getClosestPoint(point);

        // Assert
        expect(actual.x).toBeCloseTo(expected.x, 5);
        expect(actual.y).toBeCloseTo(expected.y, 5);
    });

    it('can calculate the closest point from a point on the direction vector', () => {
        // Arrange
        const snapVector = new SnapVector(new Vector(3, 8), Vector.southeast);
        const point = new Vector(9, 2);
        const expected = new Vector(9, 2);

        // Act
        const actual = snapVector.getClosestPoint(point);

        // Assert
        expect(actual.x).toBeCloseTo(expected.x, 5);
        expect(actual.y).toBeCloseTo(expected.y, 5);
    });

    it('can calculate the closest point from a point with a vertical direction', () => {
        // Arrange
        const snapVector = new SnapVector(new Vector(2, 5), new Vector(0, 1));
        const point = new Vector(-3, 7);
        const expected = new Vector(2, 7);

        // Act
        const actual = snapVector.getClosestPoint(point);

        // Assert
        expect(actual.x).toBeCloseTo(expected.x, 5);
        expect(actual.y).toBeCloseTo(expected.y, 5);
    });

    it('can calculate the closest point from a point with a horizontal direction', () => {
        // Arrange
        const snapVector = new SnapVector(new Vector(2, 5), new Vector(1, 0));
        const point = new Vector(-3, 7);
        const expected = new Vector(-3, 5);

        // Act
        const actual = snapVector.getClosestPoint(point);

        // Assert
        expect(actual.x).toBeCloseTo(expected.x, 5);
        expect(actual.y).toBeCloseTo(expected.y, 5);
    });
});
