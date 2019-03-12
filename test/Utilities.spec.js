import Utilities from "../src/utilities/general";
import Vector from "../src/models/Vector";
import Rectangle from "../src/models/graphics/Rectangle";
import Ellipse from "../src/models/graphics/Ellipse";
import Sketch from "../src/models/graphics/Sketch";
import Curve from "../src/models/graphics/Curve";
import Text from "../src/models/graphics/Text";

describe("Utilities", () => {
    it("generates unique ids", () => {
        // Arrange

        // Act
        const firstId = Utilities.generateId();
        const secondId = Utilities.generateId();

        // Assert
        expect(firstId).not.toBe(secondId);
    });

    it("parses rectangles", () => {
        // Arrange
        const graphic = {
            type: "rectangle",
            origin: { x: 0, y: 0 },
            width: 50,
            height: 100,
            fillColor: "blue",
            strokeColor: "pink",
            strokeWidth: 5,
            rotation: 45
        }, expectedRectangle = new Rectangle({
            origin: new Vector(0, 0),
            width: 50,
            height: 100,
            fillColor: "blue",
            strokeColor: "pink",
            strokeWidth: 5,
            rotation: 45
        });

        // Act
        const actualRectangle = Utilities.parseGraphic(graphic);
        actualRectangle.id = expectedRectangle.id;
        actualRectangle.boundingBoxId = expectedRectangle.boundingBoxId;

        // Assert
        expect(actualRectangle).toEqual(expectedRectangle);
    });

    it("parses ellipses", () => {
        // Arrange
        const graphic = {
            type: "ellipse",
            origin: { x: 0, y: 0 },
            width: 50,
            height: 100,
            fillColor: "blue",
            strokeColor: "pink",
            strokeWidth: 5,
            rotation: 45
        }, expectedEllipse = new Ellipse({
            origin: new Vector(0, 0),
            width: 50,
            height: 100,
            fillColor: "blue",
            strokeColor: "pink",
            strokeWidth: 5,
            rotation: 45
        });

        // Act
        const actualEllipse = Utilities.parseGraphic(graphic);
        actualEllipse.id = expectedEllipse.id;
        actualEllipse.boundingBoxId = expectedEllipse.boundingBoxId;

        // Assert
        expect(actualEllipse).toEqual(expectedEllipse);
    });

    it("parses sketches", () => {
        // Arrange
        const graphic = {
            type: "sketch",
            origin: { x: 0, y: 45 },
            points: [ { x: 0, y: 10 }, { x: 5, y: 15 }],
            fillColor: "blue",
            strokeColor: "pink",
            strokeWidth: 5,
            rotation: 45
        }, expectedSketch = new Sketch({
            origin: new Vector(0, 45),
            points: [ new Vector(0, 10), new Vector(5, 15) ],
            fillColor: "blue",
            strokeColor: "pink",
            strokeWidth: 5,
            rotation: 45
        });

        // Act
        const actualSketch = Utilities.parseGraphic(graphic);
        actualSketch.id = expectedSketch.id;
        actualSketch.boundingBoxId = expectedSketch.boundingBoxId;

        // Assert
        expect(actualSketch).toEqual(expectedSketch);
    });

    it("parses curves", () => {
        // Arrange
        const graphic = {
            type: "curve",
            origin: { x: 25, y: 10 },
            points: [ { x: 0, y: 10 }, { x: 5, y: 15 }],
            fillColor: "blue",
            strokeColor: "pink",
            strokeWidth: 5,
            rotation: 45
        }, expectedCurve = new Curve({
            origin: new Vector(25, 10),
            points: [ new Vector(0, 10), new Vector(5, 15) ],
            fillColor: "blue",
            strokeColor: "pink",
            strokeWidth: 5,
            rotation: 45
        });

        // Act
        const actualCurve = Utilities.parseGraphic(graphic);
        actualCurve.id = expectedCurve.id;
        actualCurve.boundingBoxId = expectedCurve.boundingBoxId;

        // Assert
        expect(actualCurve).toEqual(expectedCurve);
    });

    it("parses textboxes", () => {
        // Arrange
        const graphic = {
            type: "text",
            origin: { x: 0, y: 10 },
            content: "Hello World!",
            fontSize: "12px",
            fontWeight: "regular",
            fontFamily: "Times New Roman",
            fillColor: "blue",
            rotation: 45
        }, expectedTextbox = new Text({
            origin: new Vector(0, 10),
            content: "Hello World!",
            fontSize: "12px",
            fontWeight: "regular",
            fontFamily: "Times New Roman",
            fillColor: "blue",
            rotation: 45
        });

        // Act
        const actualTextbox = Utilities.parseGraphic(graphic);
        actualTextbox.id = expectedTextbox.id;
        actualTextbox.boundingBoxId = expectedTextbox.boundingBoxId;

        // Assert
        expect(actualTextbox).toEqual(expectedTextbox);
    });
});