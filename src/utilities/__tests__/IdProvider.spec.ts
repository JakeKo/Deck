import * as IdProvider from '../IdProvider';

describe('IdProvider', () => {
    it('generates unique ids', async () => {
        // Arrange

        // Act
        const id1 = IdProvider.provideId();
        await new Promise(resolve => setTimeout(resolve, 10));
        const id2 = IdProvider.provideId();

        // Assert
        expect(id1).not.toEqual(id2);
    });
});
