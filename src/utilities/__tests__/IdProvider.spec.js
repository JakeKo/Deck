import * as IdProvider from '../IdProvider';

describe('IdProvider', () => {
    it('generates unique ids', () => {
        // Arrange

        // Act
        const id1 = IdProvider.provideId();
        const id2 = IdProvider.provideId();

        // Assert
        expect(id1 === id2).toBe(false);
    });
});
