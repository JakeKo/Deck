import Vector from "../src/models/Vector";

describe("Vector", () => {
    it("can calculate magnitude", () => {
        // Arrange
        const vector1 = new Vector(0, 0);
        const vector2 = new Vector(2, 3);
        const vector3 = new Vector(-4, 1);
        const vector4 = new Vector(-5, -10);
        const vector5 = new Vector(3, -2);
        const expectedMagnitude1 = 0;
        const expectedMagnitude2 = Math.sqrt(13);
        const expectedMagnitude3 = Math.sqrt(17);
        const expectedMagnitude4 = 5 * Math.sqrt(5);
        const expectedMagnitude5 = Math.sqrt(13);
        
        // Act
        const actualMagnitude1 = vector1.magnitude;
        const actualMagnitude2 = vector2.magnitude;
        const actualMagnitude3 = vector3.magnitude;
        const actualMagnitude4 = vector4.magnitude;
        const actualMagnitude5 = vector5.magnitude;

        // Assert
        expect(actualMagnitude1).toBe(expectedMagnitude1);
        expect(actualMagnitude2).toBe(expectedMagnitude2);
        expect(actualMagnitude3).toBe(expectedMagnitude3);
        expect(actualMagnitude4).toBe(expectedMagnitude4);
        expect(actualMagnitude5).toBe(expectedMagnitude5);
    });

    it("can normalize vectors", () => {
        // Arrange
        const vector1 = new Vector(0, 0);
        const vector2 = new Vector(2, 3);
        const vector3 = new Vector(-4, 1);
        const vector4 = new Vector(-5, -10);
        const vector5 = new Vector(3, -2);
        const expectedNormal1 = new Vector(0, 0);
        const expectedNormal2 = new Vector(2 / Math.sqrt(13), 3 / Math.sqrt(13));
        const expectedNormal3 = new Vector(-4 / Math.sqrt(17), 1 / Math.sqrt(17));
        const expectedNormal4 = new Vector(-1 / Math.sqrt(5), -2 / Math.sqrt(5));
        const expectedNormal5 = new Vector(3 / Math.sqrt(13), -2 / Math.sqrt(13));
        
        // Act
        const actualNormal1 = vector1.normalized;
        const actualNormal2 = vector2.normalized;
        const actualNormal3 = vector3.normalized;
        const actualNormal4 = vector4.normalized;
        const actualNormal5 = vector5.normalized;

        // Assert
        expect(actualNormal1).toEqual(expectedNormal1);
        expect(actualNormal2).toEqual(expectedNormal2);
        expect(actualNormal3).toEqual(expectedNormal3);
        expect(actualNormal4).toEqual(expectedNormal4);
        expect(actualNormal5).toEqual(expectedNormal5);
    });

    it("can convert vectors to arrays", () => {
        // Arrange
        const vector1 = new Vector(0, 0);
        const vector2 = new Vector(2, 3);
        const vector3 = new Vector(-4, 1);
        const vector4 = new Vector(-5, -10);
        const vector5 = new Vector(3, -2);
        const expectedArray1 = [0, 0];
        const expectedArray2 = [2, 3];
        const expectedArray3 = [-4, 1];
        const expectedArray4 = [-5, -10];
        const expectedArray5 = [3, -2];
        
        // Act
        const actualArray1 = vector1.array;
        const actualArray2 = vector2.array;
        const actualArray3 = vector3.array;
        const actualArray4 = vector4.array;
        const actualArray5 = vector5.array;

        // Assert
        expect(actualArray1).toEqual(expectedArray1);
        expect(actualArray2).toEqual(expectedArray2);
        expect(actualArray3).toEqual(expectedArray3);
        expect(actualArray4).toEqual(expectedArray4);
        expect(actualArray5).toEqual(expectedArray5);
    });

    it("can calculate the sum vectors", () => {
        // Arrange
        const vector1 = new Vector(-3, 4);
        const vector2 = new Vector(2, 3);
        const expectedSum = new Vector(-1, 7);
        
        // Act
        const actualSum = vector1.add(vector2);

        // Assert
        expect(actualSum).toEqual(expectedSum);
    });

    it("can calculate the difference between two vectors", () => {
        // Arrange
        const vector1 = new Vector(-3, 4);
        const vector2 = new Vector(2, 3);
        const expectedDifference = new Vector(-5, 1);
        
        // Act
        const actualDifference = vector2.towards(vector1);

        // Assert
        expect(actualDifference).toEqual(expectedDifference);
    });

    it("can calculate the dot product of two vectors", () => {
        // Arrange
        const vector1 = new Vector(-3, 4);
        const vector2 = new Vector(2, 3);
        const expectedDotProduct = 6;
        
        // Act
        const actualDotProduct = vector1.dot(vector2);

        // Assert
        expect(actualDotProduct).toBe(expectedDotProduct);
    });

    it("can calculate the angle between two vectors (in radians)", () => {
        // Arrange
        const epsilon = 1E-5;
        const vector1 = new Vector(2, 0);
        const vector2 = new Vector(5, 5);
        const expectedAngle = Math.PI / 4;
        
        // Act
        const actualAngle = vector1.theta(vector2);

        // Assert
        expect(closeEnough(actualAngle, expectedAngle, epsilon)).toBe(true);
    });

    it("can calculate the projection of one vector onto another", () => {
        // Arrange
        const vector1 = new Vector(2, 0);
        const vector2 = new Vector(5, 5);
        const expectedProjection = new Vector(5, 0);
        
        // Act
        const actualProjection = vector2.projectOn(vector1);

        // Assert
        expect(actualProjection).toEqual(expectedProjection);
    });

    it("can scale vectors", () => {
        // Arrange
        const vector = new Vector(2, -3);
        const scalar = 3;
        const expectedScaledVector = new Vector(6, -9);
        
        // Act
        const actualScaledVector = vector.scale(scalar);

        // Assert
        expect(actualScaledVector).toEqual(expectedScaledVector);
    });

    it("can reflect a vector over itself", () => {
        // Arrange
        const vector = new Vector(2, -3);
        const expectedReflectedVector = new Vector(2, -3);
        
        // Act
        const actualReflectedVector = vector.reflect();

        // Assert
        expect(actualReflectedVector).toEqual(expectedReflectedVector);
    });

    it("can reflect a vector over an arbitrary origin vector", () => {
        // Arrange
        const vector = new Vector(2, -3);
        const origin = new Vector(-1, 2)
        const expectedReflectedVector = new Vector(-4, 7);
        
        // Act
        const actualReflectedVector = vector.reflect(origin);

        // Assert
        expect(actualReflectedVector).toEqual(expectedReflectedVector);
    });

    it("can check for equal vectors", () => {
        // Arrange
        const vector1 = new Vector(2, -3);
        const vector2 = new Vector(2, -3);
        const vector3 = new Vector(-1, 5);
        
        // Act
        const firstEqual = vector1.equals(vector2);
        const secondEqual = vector2.equals(vector3);

        // Assert
        expect(firstEqual).toBe(true);
        expect(secondEqual).toBe(false);
    });
});