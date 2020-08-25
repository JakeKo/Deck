import Vector from '@/utilities/Vector';
import { ImageMaker } from '..';
import { ImageRenderer } from '../../graphics';

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

const imageMock = {
    translate: () => imageMock,
    rotate: () => imageMock,
    width: () => imageMock,
    height: () => imageMock,
    size: () => imageMock,
    fill: () => imageMock,
    stroke: () => imageMock,
    remove: () => { return; },
    node: {
        addEventListener: () => { return; }
    }
};

const slideMock = {
    canvas: {
        rect: () => rectMock,
        ellipse: () => ellipseMock,
        image: () => imageMock,
    },
    setGraphic: () => { return; }
};

function imagesAreEqual(actual: ImageRenderer, expected: ImageRenderer) {
    expect(actual.getOrigin().x).toBeCloseTo(expected.getOrigin().x, 5);
    expect(actual.getOrigin().y).toBeCloseTo(expected.getOrigin().y, 5);
    expect(actual.getWidth()).toBeCloseTo(expected.getWidth(), 5);
    expect(actual.getHeight()).toBeCloseTo(expected.getHeight(), 5);
    expect(actual.getRotation()).toBeCloseTo(expected.getRotation(), 5);

    expect(actual.getStrokeColor()).toEqual(expected.getStrokeColor());
    expect(actual.getStrokeWidth()).toEqual(expected.getStrokeWidth());
}

describe('ImageMaker', () => {
    it('makes an image', () => {
        // Arrange
        const maker = new ImageMaker({
            slide: slideMock,
            initialPosition: Vector.zero,
            scale: 1,
            source: '',
            width: 1,
            height: 1
        });
        const expected = new ImageRenderer({
            id: '',
            slide: slideMock,
            origin: Vector.zero,
            width: 1,
            height: 1
        });

        // Act
        maker.complete();
        const actual = maker.getTarget();

        // Assert
        imagesAreEqual(actual, expected);
    });

    it('makes an image with a single resize event', () => {
        // Arrange
        const maker = new ImageMaker({
            slide: slideMock,
            initialPosition: Vector.zero,
            scale: 1,
            source: '',
            width: 1,
            height: 1
        });
        const expected = new ImageRenderer({
            id: '',
            slide: slideMock,
            origin: Vector.zero,
            width: 5.5,
            height: 5.5
        });

        // Act
        maker.resize(new Vector(4, 7), false, false, false);
        maker.complete();
        const actual = maker.getTarget();

        // Assert
        imagesAreEqual(actual, expected);
    });

    it('makes an image with a ctrl resize event', () => {
        // Arrange
        const maker = new ImageMaker({
            slide: slideMock,
            initialPosition: Vector.zero,
            scale: 1,
            source: '',
            width: 1,
            height: 1
        });
        const expected = new ImageRenderer({
            id: '',
            slide: slideMock,
            origin: new Vector(-7, -7),
            width: 14,
            height: 14
        });

        // Act
        maker.resize(new Vector(10, 4), false, true, false);
        maker.complete();
        const actual = maker.getTarget();

        // Assert
        imagesAreEqual(actual, expected);
    });

    it('can correct for zooming', () => {
        // Arrange
        const maker = new ImageMaker({
            slide: slideMock,
            initialPosition: Vector.zero,
            scale: 1,
            source: '',
            width: 1,
            height: 1
        });

        // Act
        const actual = maker.setScale(10);

        // Assert
        expect(actual).toBe(undefined);
    });
});
