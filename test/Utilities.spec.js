import Utilities from "../src/utilities/general";

describe("Utilities", () => {
    it("generates unique ids", () => {
        // Arrange

        // Act
        const firstId = Utilities.generateId();
        const secondId = Utilities.generateId();

        // Assert
        expect(firstId).not.toBe(secondId);
    });
});