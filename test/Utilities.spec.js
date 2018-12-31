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

    it("stringifies a typical object", () => {
        // Arrange
        const expectedPrettyString = `{
    "hello": "world",
    "x": 158,
    "foo": {
        "hello": "world",
        "array": [
            "string",
            2093,
            {
                "x": 4,
                "y": 7
            }
        ]
    }
}`;

        const object = {
            hello: "world",
            x: 158,
            foo: { hello: "world", array: [ "string", 2093, { x: 4, y: 7 } ] }
        };

        // Act
        const actualPrettyString = Utilities.toPrettyString(object, 1);

        // Assert
        expect(actualPrettyString).toBe(expectedPrettyString);
    });

    it("stringifies an object with undefined properties", () => {
        // Arrange
        const expectedPrettyString = `{
    "feliz": "navidad",
    "undefined": 289492,
    "ahoy": {

    },
    "array": [
        1,
        2,
        "foo"
    ]
}`;

        const object = {
            feliz: "navidad",
            undefined: 289492,
            lorem: undefined,
            ahoy: { one: undefined, two: undefined },
            array: [ undefined, 1, 2, undefined, undefined, "foo", undefined, undefined ]
        };

        // Act
        const actualPrettyString = Utilities.toPrettyString(object, 1);

        // Assert
        expect(actualPrettyString).toBe(expectedPrettyString);
    });

    it("stringifies an object with complex elements", () => {
        // Arrange
        const expectedPrettyString = `[
    [
        [
            [
                "hello",
                "world",
                {
                    "lorem": "ipsum"
                }
            ]
        ],
        {
            "foo": "bar",
            "hello": 12345
        }
    ]
]`;

        const object = [
            [
                [
                    [
                        "hello",
                        "world",
                        {
                            lorem: "ipsum"
                        }
                    ]
                ],
                {
                    foo: "bar",
                    hello: 12345
                }
            ]
        ];

        // Act
        const actualPrettyString = Utilities.toPrettyString(object, 1);

        // Assert
        expect(actualPrettyString).toBe(expectedPrettyString);
    });

    it("stringifies an object with empty objects and arrays", () => {
        // Arrange
        const expectedPrettyString = `{
    "array": [

    ],
    "object": {

    }
}`;

        const object = {
            array: [ ],
            object: { }
        };

        // Act
        const actualPrettyString = Utilities.toPrettyString(object, 1);

        // Assert
        expect(actualPrettyString).toBe(expectedPrettyString);
    });

    it("stringifies an object with escape characters", () => {
        // Arrange
        const expectedPrettyString = `{
    "string": "Hello world!\\nLook me up!"
}`;

        const object = {
            string: "Hello world!\nLook me up!"
        };

        // Act
        const actualPrettyString = Utilities.toPrettyString(object, 1);

        // Assert
        expect(actualPrettyString).toBe(expectedPrettyString);
    });
});