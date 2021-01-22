import { SlideMouseEvent } from '@/events/types';
import { resolvePosition } from '@/tools/utilities';
import SnapVector from '@/utilities/SnapVector';
import { closestVector } from '@/utilities/utilities';
import Vector from '@/utilities/Vector';
import { BoxRenderer, RotatorRenderer, VertexRenderer } from './helpers';
import { BoundingBox, BoundingBoxMutatorHelpers, IGraphicRenderer, ISlideRenderer, VERTEX_ROLES } from './types';

export function makeBoxHelpers(target: IGraphicRenderer, slide: ISlideRenderer, scale: number): BoundingBoxMutatorHelpers {
    const box = target.transformedBox;
    return {
        box: new BoxRenderer({
            slide: slide,
            scale: scale,
            origin: box.origin,
            dimensions: box.dimensions,
            rotation: box.rotation
        }),
        rotator: new RotatorRenderer({
            slide: slide,
            scale: scale,
            center: box.topRight.add(box.topRight.towards(box.bottomRight).scale(0.5)),
            parent: target,
            rotation: box.rotation
        }),
        vertices: {
            [VERTEX_ROLES.TOP_LEFT]: new VertexRenderer({
                slide: slide,
                parent: target,
                center: box.topLeft,
                scale: scale,
                role: VERTEX_ROLES.TOP_LEFT
            }),
            [VERTEX_ROLES.TOP_RIGHT]: new VertexRenderer({
                slide: slide,
                parent: target,
                center: box.topRight,
                scale: scale,
                role: VERTEX_ROLES.TOP_RIGHT
            }),
            [VERTEX_ROLES.BOTTOM_LEFT]: new VertexRenderer({
                slide: slide,
                parent: target,
                center: box.bottomLeft,
                scale: scale,
                role: VERTEX_ROLES.BOTTOM_LEFT
            }),
            [VERTEX_ROLES.BOTTOM_RIGHT]: new VertexRenderer({
                slide: slide,
                parent: target,
                center: box.bottomRight,
                scale: scale,
                role: VERTEX_ROLES.BOTTOM_RIGHT
            })
        }
    };
}

export function renderBoxHelpers(helpers: BoundingBoxMutatorHelpers): void {
    helpers.box.render();
    helpers.rotator.render();
    helpers.vertices[VERTEX_ROLES.TOP_LEFT].render();
    helpers.vertices[VERTEX_ROLES.TOP_RIGHT].render();
    helpers.vertices[VERTEX_ROLES.BOTTOM_LEFT].render();
    helpers.vertices[VERTEX_ROLES.BOTTOM_RIGHT].render();
}

export function unrenderBoxHelpers(helpers: BoundingBoxMutatorHelpers): void {
    helpers.box.unrender();
    helpers.rotator.unrender();
    helpers.vertices[VERTEX_ROLES.TOP_LEFT].unrender();
    helpers.vertices[VERTEX_ROLES.TOP_RIGHT].unrender();
    helpers.vertices[VERTEX_ROLES.BOTTOM_LEFT].unrender();
    helpers.vertices[VERTEX_ROLES.BOTTOM_RIGHT].unrender();
}

export function scaleBoxHelpers(helpers: BoundingBoxMutatorHelpers, scale: number): void {
    helpers.box.scale = scale;
    helpers.rotator.scale = scale;
    helpers.vertices[VERTEX_ROLES.TOP_LEFT].scale = scale;
    helpers.vertices[VERTEX_ROLES.TOP_RIGHT].scale = scale;
    helpers.vertices[VERTEX_ROLES.BOTTOM_LEFT].scale = scale;
    helpers.vertices[VERTEX_ROLES.BOTTOM_RIGHT].scale = scale;
}

export function rotateBoxHelpers(helpers: BoundingBoxMutatorHelpers, box: BoundingBox): void {
    helpers.box.rotation = box.rotation;
    helpers.rotator.rotation = box.rotation;
    helpers.rotator.center = box.topRight.add(box.topRight.towards(box.bottomRight).scale(0.5));
    helpers.vertices[VERTEX_ROLES.TOP_LEFT].center = box.topLeft;
    helpers.vertices[VERTEX_ROLES.TOP_RIGHT].center = box.topRight;
    helpers.vertices[VERTEX_ROLES.BOTTOM_LEFT].center = box.bottomLeft;
    helpers.vertices[VERTEX_ROLES.BOTTOM_RIGHT].center = box.bottomRight;
}

export function resizeBoxHelpers(helpers: BoundingBoxMutatorHelpers, box: BoundingBox): void {
    helpers.box.setOriginAndDimensions(box.origin, box.dimensions);
    helpers.rotator.center = box.topRight.add(box.topRight.towards(box.bottomRight).scale(0.5));
    helpers.vertices[VERTEX_ROLES.TOP_LEFT].center = box.topLeft;
    helpers.vertices[VERTEX_ROLES.TOP_RIGHT].center = box.topRight;
    helpers.vertices[VERTEX_ROLES.BOTTOM_LEFT].center = box.bottomLeft;
    helpers.vertices[VERTEX_ROLES.BOTTOM_RIGHT].center = box.bottomRight;
}

export function calculateMove({
    initialOrigin,
    initialPosition,
    mouseEvent,
    snapVectors,
    relativePullPoints
}: {
    initialOrigin: Vector;
    initialPosition: Vector;
    mouseEvent: SlideMouseEvent;
    snapVectors: SnapVector[];
    relativePullPoints: Vector[];
}): Vector {
    const { baseEvent, slide } = mouseEvent.detail;
    const position = resolvePosition(baseEvent, slide);
    const directions = [...Vector.cardinals, ...Vector.intermediates];
    const offset = initialPosition.towards(initialOrigin);

    let snapShift = Vector.zero;
    if (!baseEvent.altKey) {
        const pullPoints = relativePullPoints.map(p => position.add(p));
        const snapShifts = pullPoints.map(p => snapVectors.map(s => ({ pullPoint: p, snapVector: s, distance: s.distanceFromVector(p) })))
            .reduce((all, some) => [...all, ...some], [])
            .filter(s => s.distance < 25)
            .sort((a, b) => {
                if (a.distance < b.distance) return -1;
                else if (a.distance === b.distance) return 0;
                else return 1;
            })
            .map(shift => shift.pullPoint.towards(shift.snapVector.getClosestPoint(shift.pullPoint)));

        // TODO: Search for next closest perpendicular move (not just the second move)
        snapShift = snapShifts.length > 0
            ? snapShifts.length > 1
                ? snapShifts[0].isPerpendicular(snapShifts[1], 1E-6)
                    ? snapShifts[0].add(snapShifts[1])
                    : snapShifts[0]
                : snapShifts[0]
            : Vector.zero;
    }

    const rawMove = initialOrigin.towards(position.add(offset));

    // TODO: Handle case where moveDirection and snapShift are neither parallel nor perpendicular
    if (baseEvent.shiftKey) {
        const moveDirection = closestVector(rawMove, directions);
        const initialMove = rawMove.projectOn(moveDirection);
        const snapMove = snapShift.isParallel(moveDirection) ? snapShift : Vector.zero;
        return initialMove.add(snapMove);
    }

    return rawMove.add(snapShift);
}
