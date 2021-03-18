import { SlideMouseEvent } from '@/events/types';
import { resolvePosition } from '@/tools/utilities';
import SnapVector from '@/utilities/SnapVector';
import { closestVector } from '@/utilities/utilities';
import V from '@/utilities/Vector';
import { BoxRenderer, RotatorRenderer, SnapVectorRenderer, VertexRenderer } from './helpers';
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
    initialOrigin: V;
    initialPosition: V;
    mouseEvent: SlideMouseEvent;
    snapVectors: SnapVector[];
    relativePullPoints: V[];
}): { snapVectors: SnapVector[]; shift: V } {
    const { baseEvent, slide } = mouseEvent.detail;
    const position = resolvePosition(baseEvent, slide);
    const rawMove = initialOrigin.towards(position.add(initialPosition.towards(initialOrigin)));
    const moveDirection = baseEvent.shiftKey ? closestVector(rawMove, [...V.cardinals, ...V.intermediates]) : V.zero;

    const snapPulls: { shift: V; snapVector: SnapVector }[] = [];
    if (!baseEvent.altKey) {
        const pullPoints = relativePullPoints.map(p => position.add(p));
        const pullOptions = pullPoints.map(p => snapVectors.map(s => ({ shift: p.towards(s.getClosestPoint(p)), snapVector: s })))
            .reduce((all, some) => [...all, ...some], [])
            .filter(s => s.shift.magnitude < 25 && s.shift.isParallel(moveDirection))
            .sort((a, b) => {
                if (a.shift.magnitude < b.shift.magnitude) return -1;
                else if (a.shift.magnitude === b.shift.magnitude) return 0;
                else return 1;
            });

        if (pullOptions.length >= 1) {
            const [firstShift, ...otherShifts] = pullOptions;
            snapPulls.push(firstShift);

            // Find the next closest shift that is perpendicular to the first shift (if there is one)
            for (const shift of otherShifts) {
                if (firstShift.shift.isPerpendicular(shift.shift)) {
                    snapPulls.push(shift);
                    break;
                }
            }
        }
    }

    const finalSnapPull = snapPulls.reduce((finalPull, pull) => finalPull.add(pull.shift), V.zero);

    // TODO: Handle case where moveDirection and snapShift are neither parallel nor perpendicular
    return {
        shift: (baseEvent.shiftKey ? rawMove.projectOn(moveDirection) : rawMove).add(finalSnapPull),
        snapVectors: snapPulls.map(s => s.snapVector)
    };
}

/**
 * Create initial SnapVectorRenderers for a mutator
 */
export function makeSnapVectors(slide: ISlideRenderer, scale: number): SnapVectorRenderer[] {
    return [
        new SnapVectorRenderer({
            scale,
            slide,
            snapVector: new SnapVector(V.zero, V.zero)
        }),
        new SnapVectorRenderer({
            scale,
            slide,
            snapVector: new SnapVector(V.zero, V.zero)
        })
    ];
}

/**
 * Given the two models representing active snap vectors, reconcile the provided renderers so they match the models
 */
export function updateSnapVectors(models: SnapVector[], renderers: SnapVectorRenderer[]): void {
    const [m1, m2] = models;
    const [r1, r2] = renderers;

    if (models.length === 0) {
        r1.unrender();
        r2.unrender();
    } else if (models.length === 1) {
        r1.render();
        r1.snapVector = m1;
        r2.unrender();
    } else if (models.length === 2) {
        r1.render();
        r1.snapVector = m1;
        r2.render();
        r2.snapVector = m2;
    }
}
