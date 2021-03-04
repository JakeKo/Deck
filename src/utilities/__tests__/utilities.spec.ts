import * as Utilities from '../utilities';
import V from '../Vector';

describe('Utilities', () => {
    describe('closestVector', () => {
        it('can find the closest vector given one candidate', () => {
            // Arrange
            const candidates = [V.east];
            const target = V.southwest;
            const expected = V.east;

            // Act
            const actual = Utilities.closestVector(target, candidates);

            // Assert
            expect(actual).toEqual(expected);
        });

        it('can find the closest vector given multiple candidates', () => {
            // Arrange
            const candidates = [V.east, V.south];
            const target = V.southwest;
            const expected = V.south;

            // Act
            const actual = Utilities.closestVector(target, candidates);

            // Assert
            expect(actual).toEqual(expected);
        });

        it('can find the closest vector when target is aligned with candidate', () => {
            // Arrange
            const candidates = [V.east, V.southwest];
            const target = V.southwest;
            const expected = V.southwest;

            // Act
            const actual = Utilities.closestVector(target, candidates);

            // Assert
            expect(actual).toEqual(expected);
        });
    });

    describe('mod', () => {
        it('calculates modulo with n < m', () => {
            // Arrange
            const n = 5;
            const m = 7;
            const expected = 5;

            // Act
            const actual = Utilities.mod(n, m);

            // Assert
            expect(actual).toEqual(expected);
        });

        it('calculates modulo with n > m', () => {
            // Arrange
            const n = 12;
            const m = 7;
            const expected = 5;

            // Act
            const actual = Utilities.mod(n, m);

            // Assert
            expect(actual).toEqual(expected);
        });

        it('calculates modulo with n = m', () => {
            // Arrange
            const n = 7;
            const m = 7;
            const expected = 0;

            // Act
            const actual = Utilities.mod(n, m);

            // Assert
            expect(actual).toEqual(expected);
        });

        it('calculates modulo with n < 0 < m', () => {
            // Arrange
            const n = -2;
            const m = 7;
            const expected = 5;

            // Act
            const actual = Utilities.mod(n, m);

            // Assert
            expect(actual).toEqual(expected);
        });
    });

    describe('radToDeg', () => {
        it('converts radians to degrees', () => {
            // Arrange
            const rad = Math.PI / 4;
            const expected = 45;

            // Act
            const actual = Utilities.radToDeg(rad);

            // Assert
            expect(actual).toEqual(expected);
        });

        it('converts negative radians to degrees', () => {
            // Arrange
            const rad = -Math.PI / 4;
            const expected = -45;

            // Act
            const actual = Utilities.radToDeg(rad);

            // Assert
            expect(actual).toEqual(expected);
        });
    });

    describe('degToRad', () => {
        it('converts degrees to radians', () => {
            // Arrange
            const deg = 45;
            const expected = Math.PI / 4;

            // Act
            const actual = Utilities.degToRad(deg);

            // Assert
            expect(actual).toEqual(expected);
        });

        it('converts negative degrees to radians', () => {
            // Arrange
            const deg = -45;
            const expected = -Math.PI / 4;

            // Act
            const actual = Utilities.degToRad(deg);

            // Assert
            expect(actual).toEqual(expected);
        });
    });
});
