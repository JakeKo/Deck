jest.mock('../../SlideRenderer');

import SlideStateManager from '@/utilities/SlideStateManager';
import Vector from '@/utilities/Vector';
import SVG from 'svg.js';
import { EllipseMaker } from '..';
import { EllipseRenderer } from '../../graphics';
import SlideRenderer from '../../SlideRenderer';
import { mocked } from 'ts-jest';

function ellipsesAreEqual(actual: EllipseRenderer, expected: EllipseRenderer) {
    expect(actual.getCenter().x).toBeCloseTo(expected.getCenter().x, 5);
    expect(actual.getCenter().y).toBeCloseTo(expected.getCenter().y, 5);
    expect(actual.getWidth()).toBeCloseTo(expected.getWidth(), 5);
    expect(actual.getHeight()).toBeCloseTo(expected.getHeight(), 5);
    expect(actual.getRotation()).toBeCloseTo(expected.getRotation(), 5);

    expect(actual.getFillColor()).toEqual(expected.getFillColor());
    expect(actual.getStrokeColor()).toEqual(expected.getStrokeColor());
    expect(actual.getStrokeWidth()).toEqual(expected.getStrokeWidth());
}

describe('EllipseMaker', () => {
    it('makes an ellipse', () => {
        // Arrange
        const slide = mocked(SlideRenderer);
        const maker = new EllipseMaker({
            slide: slide.prototype,
            initialPosition: Vector.zero,
            scale: 1
        });
        const expected = new EllipseRenderer({
            id: '',
            slide: slide.prototype,
            center: Vector.zero
        });

        // Act
        maker.complete();
        const actual = maker.getTarget();

        // Assert
        ellipsesAreEqual(actual, expected);
    });

    it('makes an ellipse with a single resize event', () => {
        // Arrange
        const slide = mocked(SlideRenderer);
        const maker = new EllipseMaker({
            slide: slide.prototype,
            initialPosition: Vector.zero,
            scale: 1
        });
        const expected = new EllipseRenderer({
            id: '',
            slide: slide.prototype,
            center: new Vector(2, 3.5),
            width: 4,
            height: 7
        });

        // Act
        maker.resize(new Vector(4, 7), false, false, false);
        maker.complete();
        const actual = maker.getTarget();

        // Assert
        ellipsesAreEqual(actual, expected);
    });

    it('makes an ellipse with multiple resize events', () => {
        // Arrange
        const slide = mocked(SlideRenderer);
        const maker = new EllipseMaker({
            slide: slide.prototype,
            initialPosition: Vector.zero,
            scale: 1
        });
        const expected = new EllipseRenderer({
            id: '',
            slide: slide.prototype,
            center: new Vector(2.5, 1),
            width: 5,
            height: 2
        });

        // Act
        maker.resize(new Vector(4, 7), false, false, false);
        maker.resize(new Vector(5, 2), false, false, false);
        maker.complete();
        const actual = maker.getTarget();

        // Assert
        ellipsesAreEqual(actual, expected);
    });

    it('makes an ellipse with a shift resize event', () => {
        // Arrange
        const slide = mocked(SlideRenderer);
        const maker = new EllipseMaker({
            slide: slide.prototype,
            initialPosition: Vector.zero,
            scale: 1
        });
        const expected = new EllipseRenderer({
            id: '',
            slide: slide.prototype,
            center: new Vector(-3, 3),
            width: 6,
            height: 6
        });

        // Act
        maker.resize(new Vector(-4, 8), true, false, false);
        maker.complete();
        const actual = maker.getTarget();

        // Assert
        ellipsesAreEqual(actual, expected);
    });

    it('makes an ellipse with a ctrl resize event', () => {
        // Arrange
        const slide = mocked(SlideRenderer);
        const maker = new EllipseMaker({
            slide: slide.prototype,
            initialPosition: Vector.zero,
            scale: 1
        });
        const expected = new EllipseRenderer({
            id: '',
            slide: slide.prototype,
            center: Vector.zero,
            width: 10,
            height: 4
        });

        // Act
        maker.resize(new Vector(5, 2), false, true, false);
        maker.complete();
        const actual = maker.getTarget();

        // Assert
        ellipsesAreEqual(actual, expected);
    });

    it('makes an ellipse with a ctrl and shift resize event', () => {
        // Arrange
        const slide = mocked(SlideRenderer);
        const maker = new EllipseMaker({
            slide: slide.prototype,
            initialPosition: Vector.zero,
            scale: 1
        });
        const expected = new EllipseRenderer({
            id: '',
            slide: slide.prototype,
            center: Vector.zero,
            width: 14,
            height: 14
        });

        // Act
        maker.resize(new Vector(10, 4), true, true, false);
        maker.complete();
        const actual = maker.getTarget();

        // Assert
        ellipsesAreEqual(actual, expected);
    });

    it('can correct for zooming', () => {
        // Arrange
        const slide = mocked(SlideRenderer);
        const maker = new EllipseMaker({
            slide: slide.prototype,
            initialPosition: Vector.zero,
            scale: 1
        });

        // Act
        const actual = maker.setScale(10);

        // Assert
        expect(actual).toBe(undefined);
    });
});
