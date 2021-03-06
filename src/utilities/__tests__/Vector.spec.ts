import V from '../Vector';

describe('Vector', () => {
    it('can calculate magnitude', () => {
        // Arrange
        const vector1 = new V(0, 0);
        const vector2 = new V(2, 3);
        const vector3 = new V(-4, 1);
        const vector4 = new V(-5, -10);
        const vector5 = new V(3, -2);
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

    it('can normalize vectors', () => {
        // Arrange
        const vector1 = new V(0, 0);
        const vector2 = new V(2, 3);
        const vector3 = new V(-4, 1);
        const vector4 = new V(-5, -10);
        const vector5 = new V(3, -2);
        const expectedNormal1 = new V(0, 0);
        const expectedNormal2 = new V(2 / Math.sqrt(13), 3 / Math.sqrt(13));
        const expectedNormal3 = new V(-4 / Math.sqrt(17), 1 / Math.sqrt(17));
        const expectedNormal4 = new V(-1 / Math.sqrt(5), -2 / Math.sqrt(5));
        const expectedNormal5 = new V(3 / Math.sqrt(13), -2 / Math.sqrt(13));

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

    it('can convert vectors to arrays', () => {
        // Arrange
        const vector1 = new V(0, 0);
        const vector2 = new V(2, 3);
        const vector3 = new V(-4, 1);
        const vector4 = new V(-5, -10);
        const vector5 = new V(3, -2);
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

    it('can take the absolute value of vectos', () => {
        // Arrange
        const vector1 = V.northeast;
        const vector2 = V.northwest;
        const vector3 = V.southwest;
        const vector4 = V.southeast;
        const expected = V.northeast;

        // Act
        const actual1 = vector1.abs;
        const actual2 = vector2.abs;
        const actual3 = vector3.abs;
        const actual4 = vector4.abs;

        // Assert
        expect(actual1).toEqual(expected);
        expect(actual2).toEqual(expected);
        expect(actual3).toEqual(expected);
        expect(actual4).toEqual(expected);
    });

    it('can calculate the sum of two vectors', () => {
        // Arrange
        const vector1 = new V(-3, 4);
        const vector2 = new V(2, 3);
        const expectedSum = new V(-1, 7);

        // Act
        const actualSum = vector1.add(vector2);

        // Assert
        expect(actualSum).toEqual(expectedSum);
    });

    it('can calculate the difference between two vectors', () => {
        // Arrange
        const vector1 = new V(-3, 4);
        const vector2 = new V(2, 3);
        const expectedDifference = new V(-5, 1);

        // Act
        const actualDifference = vector2.towards(vector1);

        // Assert
        expect(actualDifference).toEqual(expectedDifference);
    });

    it('can calculate the dot product of two vectors', () => {
        // Arrange
        const vector1 = new V(-3, 4);
        const vector2 = new V(2, 3);
        const expectedDotProduct = 6;

        // Act
        const actualDotProduct = vector1.dot(vector2);

        // Assert
        expect(actualDotProduct).toBe(expectedDotProduct);
    });

    it('can calculate the angle between two vectors (in radians)', () => {
        // Arrange
        const vector1 = V.east;
        const vector2 = new V(5, 5);
        const vector3 = new V(-5, 5);
        const vector4 = new V(-5, -5);
        const vector5 = new V(5, -5);
        const expectedAngle1 = Math.PI * 1 / 4;
        const expectedAngle2 = Math.PI * 3 / 4;
        const expectedAngle3 = Math.PI * 5 / 4;
        const expectedAngle4 = Math.PI * 7 / 4;
        const expectedAngle5 = Math.PI * 3 / 2;

        // Act
        const actualAngle1 = vector2.theta(vector1);
        const actualAngle2 = vector3.theta(vector1);
        const actualAngle3 = vector4.theta(vector1);
        const actualAngle4 = vector5.theta(vector1);
        const actualAngle5 = vector5.theta(vector2);

        // Assert
        expect(actualAngle1).toBeCloseTo(expectedAngle1, 5);
        expect(actualAngle2).toBeCloseTo(expectedAngle2, 5);
        expect(actualAngle3).toBeCloseTo(expectedAngle3, 5);
        expect(actualAngle4).toBeCloseTo(expectedAngle4, 5);
        expect(actualAngle5).toBeCloseTo(expectedAngle5, 5);
    });

    it('can calculate the projection of one vector onto another', () => {
        // Arrange
        const vector1 = new V(2, 0);
        const vector2 = new V(5, 5);
        const expectedProjection = new V(5, 0);

        // Act
        const actualProjection = vector2.projectOn(vector1);

        // Assert
        expect(actualProjection).toEqual(expectedProjection);
    });

    it('can scale vectors', () => {
        // Arrange
        const vector = new V(2, -3);
        const scalar = 3;
        const expectedScaledVector = new V(6, -9);

        // Act
        const actualScaledVector = vector.scale(scalar);

        // Assert
        expect(actualScaledVector).toEqual(expectedScaledVector);
    });

    it('can reflect a vector over itself', () => {
        // Arrange
        const vector = new V(2, -3);
        const expectedReflectedVector = new V(2, -3);

        // Act
        const actualReflectedVector = vector.reflect();

        // Assert
        expect(actualReflectedVector).toEqual(expectedReflectedVector);
    });

    it('can reflect a vector over an arbitrary origin vector', () => {
        // Arrange
        const vector = new V(2, -3);
        const origin = new V(-1, 2);
        const expectedReflectedVector = new V(-4, 7);

        // Act
        const actualReflectedVector = vector.reflect(origin);

        // Assert
        expect(actualReflectedVector).toEqual(expectedReflectedVector);
    });

    it('can check for equal vectors', () => {
        // Arrange
        const vector1 = new V(2, -3);
        const vector2 = new V(2, -3);
        const vector3 = new V(-1, 5);

        // Act
        const firstEqual = vector1.equals(vector2);
        const secondEqual = vector2.equals(vector3);

        // Assert
        expect(firstEqual).toBe(true);
        expect(secondEqual).toBe(false);
    });

    it('can sign vectors', () => {
        // Arrange
        const v = V.southwest;
        const expected = V.northeast;

        // Act
        const actual = v.signAs(new V(2, 7));

        // Assert
        expect(actual).toEqual(expected);
    });

    it('can append rotation to vectors', () => {
        // Arrange
        const v1 = V.east;
        const v2 = V.southwest;
        const expected1 = V.northeast;
        const expected2 = V.south;

        // Act
        const actual1 = v1.rotate(Math.PI / 4);
        const actual2 = v2.rotate(Math.PI / 4);

        // Assert
        expect(actual1.x).toBeCloseTo(expected1.x, 5);
        expect(actual1.y).toBeCloseTo(expected1.y, 5);
        expect(actual2.x).toBeCloseTo(expected2.x, 5);
        expect(actual2.y).toBeCloseTo(expected2.y, 5);
    });

    describe('slice', () => {
        it('can slice a circle into zero pieces', () => {
            // Arrange
            const n = 0;
            const expectedSlices: V[] = [];

            // Act
            const actualSlices = V.slice(n);

            // Assert
            expect(actualSlices).toEqual(expectedSlices);
        });

        it('can slice a circle into one piece', () => {
            // Arrange
            const n = 1;
            const expectedSlices: V[] = [V.east];

            // Act
            const actualSlices = V.slice(n);

            // Assert
            actualSlices.forEach((actualSlice, index) => {
                const expectedSlice = expectedSlices[index];
                expect(actualSlice.x).toBeCloseTo(expectedSlice.x, 5);
                expect(actualSlice.y).toBeCloseTo(expectedSlice.y, 5);
            });
        });

        it('can slice a circle into more than one piece', () => {
            // Arrange
            const n = 4;
            const expectedSlices: V[] = [V.east, V.north, V.west, V.south];

            // Act
            const actualSlices = V.slice(n);

            // Assert
            actualSlices.forEach((actualSlice, index) => {
                const expectedSlice = expectedSlices[index];
                expect(actualSlice.x).toBeCloseTo(expectedSlice.x, 5);
                expect(actualSlice.y).toBeCloseTo(expectedSlice.y, 5);
            });
        });
    });
});
