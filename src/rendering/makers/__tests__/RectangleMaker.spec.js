import { RectangleMaker } from '..';
import Vector from '../../../utilities/Vector';
import { RectangleRenderer } from '../../graphics';

const rectMock = {
    translate: () => rectMock,
    rotate: () => rectMock,
    width: () => rectMock,
    height: () => rectMock,
    size: () => rectMock,
    fill: () => rectMock,
    stroke: () => rectMock,
    remove: () => { return; },
    node: {
        addEventListener: () => { return; }
    }
};

const ellipseMock = {
    center: () => ellipseMock,
    translate: () => ellipseMock,
    rotate: () => ellipseMock,
    width: () => ellipseMock,
    height: () => ellipseMock,
    size: () => rectMock,
    fill: () => ellipseMock,
    stroke: () => ellipseMock,
    remove: () => { return; },
    node: {
        addEventListener: () => { return; }
    }
};

const slideMock = {
    canvas: {
        rect: () => rectMock,
        ellipse: () => ellipseMock
    },
    setGraphic: () => { return; }
};

function rectanglesAreEqual(actual, expected) {
    const epsilon = 1E-8;

    expect(vectorsCloseEnough(actual.getOrigin(), expected.getOrigin(), epsilon)).toBe(true);
    expect(closeEnough(actual.getWidth(), expected.getWidth(), epsilon)).toBe(true);
    expect(closeEnough(actual.getHeight(), expected.getHeight(), epsilon)).toBe(true);
    expect(closeEnough(actual.getRotation(), expected.getRotation(), epsilon)).toBe(true);

    expect(actual.getFillColor()).toEqual(expected.getFillColor());
    expect(actual.getStrokeColor()).toEqual(expected.getStrokeColor());
    expect(actual.getStrokeWidth()).toEqual(expected.getStrokeWidth());
}

describe('RectangleMaker', () => {
    it('makes a rectangle', () => {
        // Arrange
        const maker = new RectangleMaker({
            slide: slideMock,
            initialPosition: Vector.zero,
            scale: 1
        });
        const expected = new RectangleRenderer({
            id: '',
            slide: slideMock,
            origin: Vector.zero
        });

        // Act
        maker.complete();
        const actual = maker.getTarget();

        // Assert
        rectanglesAreEqual(actual, expected);
    });

    it('makes a rectangle with a single resize event', () => {
        // Arrange
        const maker = new RectangleMaker({
            slide: slideMock,
            initialPosition: Vector.zero,
            scale: 1
        });
        const expected = new RectangleRenderer({
            id: '',
            slide: slideMock,
            origin: Vector.zero,
            width: 4,
            height: 7
        });

        // Act
        maker.resize(new Vector(4, 7), false, false, false);
        maker.complete();
        const actual = maker.getTarget();

        // Assert
        rectanglesAreEqual(actual, expected);
    });

    it('makes a rectangle with multiple resize events', () => {
        // Arrange
        const maker = new RectangleMaker({
            slide: slideMock,
            initialPosition: Vector.zero,
            scale: 1
        });
        const expected = new RectangleRenderer({
            id: '',
            slide: slideMock,
            origin: Vector.zero,
            width: 5,
            height: 2
        });

        // Act
        maker.resize(new Vector(4, 7), false, false, false);
        maker.resize(new Vector(5, 2), false, false, false);
        maker.complete();
        const actual = maker.getTarget();

        // Assert
        rectanglesAreEqual(actual, expected);
    });

    it('makes a rectangle with a shift resize event', () => {
        // Arrange
        const maker = new RectangleMaker({
            slide: slideMock,
            initialPosition: Vector.zero,
            scale: 1
        });
        const expected = new RectangleRenderer({
            id: '',
            slide: slideMock,
            origin: new Vector(-5.5, 0),
            width: 5.5,
            height: 5.5
        });

        // Act
        maker.resize(new Vector(-4, 7), true, false, false);
        maker.complete();
        const actual = maker.getTarget();

        // Assert
        rectanglesAreEqual(actual, expected);
    });

    it('makes a rectangle with a ctrl resize event', () => {
        // Arrange
        const maker = new RectangleMaker({
            slide: slideMock,
            initialPosition: Vector.zero,
            scale: 1
        });
        const expected = new RectangleRenderer({
            id: '',
            slide: slideMock,
            origin: new Vector(-5, -2),
            width: 10,
            height: 4
        });

        // Act
        maker.resize(new Vector(5, 2), false, true, false);
        maker.complete();
        const actual = maker.getTarget();

        // Assert
        rectanglesAreEqual(actual, expected);
    });

    it('makes a rectangle with a ctrl and shift resize event', () => {
        // Arrange
        const maker = new RectangleMaker({
            slide: slideMock,
            initialPosition: Vector.zero,
            scale: 1
        });
        const expected = new RectangleRenderer({
            id: '',
            slide: slideMock,
            origin: new Vector(-7, -7),
            width: 14,
            height: 14
        });

        // Act
        maker.resize(new Vector(10, 4), true, true, false);
        maker.complete();
        const actual = maker.getTarget();

        // Assert
        rectanglesAreEqual(actual, expected);
    });

    it('can correct for zooming', () => {
        // Arrange
        const maker = new RectangleMaker({
            slide: slideMock,
            initialPosition: Vector.zero,
            scale: 1
        });

        // Act
        const actual = maker.setScale(10);

        // Assert
        expect(actual).toBe(undefined);
    });
});
