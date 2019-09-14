import Utilities from '../src/utilities';
import Vector from '../src/models/Vector';
import Rectangle from '../src/models/graphics/Rectangle';
import Ellipse from '../src/models/graphics/Ellipse';
import Sketch from '../src/models/graphics/Sketch';
import Curve from '../src/models/graphics/Curve';
import Text from '../src/models/graphics/Text';
import SnapVector from '../src/models/SnapVector';

describe('Utilities', () => {
    it('generates unique ids', () => {
        // Arrange

        // Act
        const firstId = Utilities.generateId();
        const secondId = Utilities.generateId();

        // Assert
        expect(firstId).not.toBe(secondId);
    });

    it('parses rectangles', () => {
        // Arrange
        const graphic = {
            id: 'foo',
            type: 'rectangle',
            origin: { x: 0, y: 0 },
            width: 50,
            height: 100,
            fillColor: 'blue',
            strokeColor: 'pink',
            strokeWidth: 5,
            rotation: 45
        }, expectedRectangle = new Rectangle({
            id: 'foo',
            origin: new Vector(0, 0),
            width: 50,
            height: 100,
            fillColor: 'blue',
            strokeColor: 'pink',
            strokeWidth: 5,
            rotation: 45
        });

        // Act
        const actualRectangle = Utilities.parseGraphic(graphic);

        // Assert
        expect(actualRectangle).toEqual(expectedRectangle);
    });

    it('parses ellipses', () => {
        // Arrange
        const graphic = {
            id: 'foo',
            type: 'ellipse',
            origin: { x: 0, y: 0 },
            width: 50,
            height: 100,
            fillColor: 'blue',
            strokeColor: 'pink',
            strokeWidth: 5,
            rotation: 45
        }, expectedEllipse = new Ellipse({
            id: 'foo',
            origin: new Vector(0, 0),
            width: 50,
            height: 100,
            fillColor: 'blue',
            strokeColor: 'pink',
            strokeWidth: 5,
            rotation: 45
        });

        // Act
        const actualEllipse = Utilities.parseGraphic(graphic);

        // Assert
        expect(actualEllipse).toEqual(expectedEllipse);
    });

    it('parses sketches', () => {
        // Arrange
        const graphic = {
            id: 'foo',
            type: 'sketch',
            origin: { x: 0, y: 45 },
            points: [ { x: 0, y: 10 }, { x: 5, y: 15 }],
            fillColor: 'blue',
            strokeColor: 'pink',
            strokeWidth: 5,
            rotation: 45
        }, expectedSketch = new Sketch({
            id: 'foo',
            origin: new Vector(0, 45),
            points: [ new Vector(0, 10), new Vector(5, 15) ],
            fillColor: 'blue',
            strokeColor: 'pink',
            strokeWidth: 5,
            rotation: 45
        });

        // Act
        const actualSketch = Utilities.parseGraphic(graphic);

        // Assert
        expect(actualSketch).toEqual(expectedSketch);
    });

    it('parses curves', () => {
        // Arrange
        const graphic = {
            id: 'foo',
            type: 'curve',
            origin: { x: 25, y: 10 },
            points: [ { x: 0, y: 10 }, { x: 5, y: 15 }],
            fillColor: 'blue',
            strokeColor: 'pink',
            strokeWidth: 5,
            rotation: 45
        }, expectedCurve = new Curve({
            id: 'foo',
            origin: new Vector(25, 10),
            points: [ new Vector(0, 10), new Vector(5, 15) ],
            fillColor: 'blue',
            strokeColor: 'pink',
            strokeWidth: 5,
            rotation: 45
        });

        // Act
        const actualCurve = Utilities.parseGraphic(graphic);

        // Assert
        expect(actualCurve).toEqual(expectedCurve);
    });

    it('parses textboxes', () => {
        // Arrange
        const graphic = {
            id: 'foo',
            type: 'text',
            origin: { x: 0, y: 10 },
            content: 'Hello World!',
            fontSize: '12px',
            fontWeight: 'regular',
            fontFamily: 'Times New Roman',
            fillColor: 'blue',
            rotation: 45
        }, expectedTextbox = new Text({
            id: 'foo',
            origin: new Vector(0, 10),
            content: 'Hello World!',
            fontSize: '12px',
            fontWeight: 'regular',
            fontFamily: 'Times New Roman',
            fillColor: 'blue',
            rotation: 45
        });

        // Act
        const actualTextbox = Utilities.parseGraphic(graphic);

        // Assert
        expect(actualTextbox).toEqual(expectedTextbox);
    });

    it('creates a consistent anchor graphic', () => {
        // Arrange
        const expectedAnchorGraphic = new Ellipse({
            id: 'foo',
            defaultInteractive: false,
            supplementary: true,
            origin: new Vector(-4, -4),
            height: 8,
            width: 8,
            fillColor: 'white',
            strokeColor: 'hotpink',
            strokeWidth: 2
        });

        // Act
        const actualAnchorGraphic = Utilities.makeAnchorGraphic('foo', new Vector(0, 0));

        // Assert
        expect(actualAnchorGraphic).toEqual(expectedAnchorGraphic);
    });

    it('stringifies a basic JSON object', () => {
        // Arrange
        const json = { x: 0, y: 3, 'foo-bar': 'hello world' };
        const expectedPrettyString = '{\n    "x": 0,\n    "y": 3,\n    "foo-bar": "hello world"\n}';

        // Act
        const actualPrettyString = Utilities.toPrettyString(json);

        // Assert
        expect(actualPrettyString).toEqual(expectedPrettyString);
    });

    it('stringifies a JSON object with an object property', () => {
        // Arrange
        const json = { foo: { bar: 'hello world' }, bar: 'hello world' };
        const expectedPrettyString = '{\n    "foo": {\n        "bar": "hello world"\n    },\n    "bar": "hello world"\n}';

        // Act
        const actualPrettyString = Utilities.toPrettyString(json);

        // Assert
        expect(actualPrettyString).toEqual(expectedPrettyString);
    });

    it('stringifies a JSON object with an array property', () => {
        // Arrange
        const json = { foo: [ 0, 1, 2 ], bar: 'hello world' };
        const expectedPrettyString = '{\n    "foo": [\n        0,\n        1,\n        2\n    ],\n    "bar": "hello world"\n}';

        // Act
        const actualPrettyString = Utilities.toPrettyString(json);

        // Assert
        expect(actualPrettyString).toEqual(expectedPrettyString);
    });

    it('stringifies an empty JSON object', () => {
        // Arrange
        const json = {};
        const expectedPrettyString = '{\n\n}';

        // Act
        const actualPrettyString = Utilities.toPrettyString(json);

        // Assert
        expect(actualPrettyString).toEqual(expectedPrettyString);
    });

    it('gets the translation from a snap source to a snap destination', () => {
        // Arrange
        const snap = {
            source: new Vector(0, 0),
            destination: new SnapVector('foo', new Vector(1, 1), Vector.up)
        };
        const expectedTranslation = new Vector(1, 0);

        // Act
        const actualTranslation = Utilities.getTranslation(snap);

        // Assert
        expect(actualTranslation).toEqual(expectedTranslation);
    });

    it('gets the translation from a snap source to an identical snap destination', () => {
        // Arrange
        const snap = {
            source: new Vector(0, 0),
            destination: new SnapVector('foo', new Vector(0, 0), Vector.up)
        };
        const expectedTranslation = new Vector(0, 0);

        // Act
        const actualTranslation = Utilities.getTranslation(snap);

        // Assert
        expect(actualTranslation).toEqual(expectedTranslation);
    });
});