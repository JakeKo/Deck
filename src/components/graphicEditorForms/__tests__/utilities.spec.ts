import { correctForRotationWhenChangingDimensions } from '../utilities';
import V from '@/utilities/Vector';

describe('utilities', () => {
    describe('correctForRotationWhenChangingDimensions', () => {
        it('corrects for no rotation and changing width', () => {
            // Arrange
            const basePoint = V.zero;
            const initialDimensions = new V(2, 2);
            const newDimensions = new V(4, 2);
            const rotation = 0;
            const expected = V.zero;

            // Act
            const actual = correctForRotationWhenChangingDimensions({
                basePoint,
                initialDimensions,
                newDimensions,
                rotation
            });

            // Assert
            expect(actual.x).toBeCloseTo(expected.x, 5);
            expect(actual.y).toBeCloseTo(expected.y, 5);
        });
        
        it('corrects for no rotation and changing height', () => {
            // Arrange
            const basePoint = V.zero;
            const initialDimensions = new V(2, 2);
            const newDimensions = new V(2, 4);
            const rotation = 0;
            const expected = V.zero;

            // Act
            const actual = correctForRotationWhenChangingDimensions({
                basePoint,
                initialDimensions,
                newDimensions,
                rotation
            });

            // Assert
            expect(actual.x).toBeCloseTo(expected.x, 5);
            expect(actual.y).toBeCloseTo(expected.y, 5);
        });
        
        it('corrects for no rotation and changing width and height', () => {
            // Arrange
            const basePoint = V.zero;
            const initialDimensions = new V(2, 2);
            const newDimensions = new V(4, 4);
            const rotation = 0;
            const expected = V.zero;

            // Act
            const actual = correctForRotationWhenChangingDimensions({
                basePoint,
                initialDimensions,
                newDimensions,
                rotation
            });

            // Assert
            expect(actual.x).toBeCloseTo(expected.x, 5);
            expect(actual.y).toBeCloseTo(expected.y, 5);
        });
        
        it('corrects for rotation and changing width', () => {
            // Arrange
            const basePoint = V.zero;
            const initialDimensions = new V(2, 2);
            const newDimensions = new V(4, 2);
            const rotation = Math.PI / 4;
            const expected = new V(Math.SQRT1_2 - 1, Math.SQRT1_2);

            // Act
            const actual = correctForRotationWhenChangingDimensions({
                basePoint,
                initialDimensions,
                newDimensions,
                rotation
            });

            // Assert
            expect(actual.x).toBeCloseTo(expected.x, 5);
            expect(actual.y).toBeCloseTo(expected.y, 5);
        });
        
        it('corrects for rotation and changing height', () => {
            // Arrange
            const basePoint = V.zero;
            const initialDimensions = new V(2, 2);
            const newDimensions = new V(2, 4);
            const rotation = Math.PI / 4;
            const expected = new V(-Math.SQRT1_2, Math.SQRT1_2 - 1);

            // Act
            const actual = correctForRotationWhenChangingDimensions({
                basePoint,
                initialDimensions,
                newDimensions,
                rotation
            });

            // Assert
            expect(actual.x).toBeCloseTo(expected.x, 5);
            expect(actual.y).toBeCloseTo(expected.y, 5);
        });
        
        it('corrects for rotation and changing width and height', () => {
            // Arrange
            const basePoint = V.zero;
            const initialDimensions = new V(2, 2);
            const newDimensions = new V(4, 4);
            const rotation = Math.PI / 4;
            const expected = new V(-1, Math.SQRT2 - 1);
            
            // Act
            const actual = correctForRotationWhenChangingDimensions({
                basePoint,
                initialDimensions,
                newDimensions,
                rotation
            });

            // Assert
            expect(actual.x).toBeCloseTo(expected.x, 5);
            expect(actual.y).toBeCloseTo(expected.y, 5);
        });
    });
});
