import Utilities from "../src/utilities";

describe("Utilities", () => {
    it("generates unique ids", () => {
        expect(Utilities.generateId()).toNotBe(Utilities.generateId());
    })
});