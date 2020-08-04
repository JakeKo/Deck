import Vector from '../utilities/Vector';
import { BoxRenderer, CanvasRenderer, RotatorRenderer, VertexRenderer } from './helpers';
import SlideRenderer from './SlideRenderer';
import { BoundingBox, BoundingBoxMutatorHelpers, GraphicRenderer, VERTEX_ROLES } from './types';

export function renderBackdrop(slideRenderer: SlideRenderer, width: number, height: number): void {
    new CanvasRenderer({
        slide: slideRenderer,
        origin: Vector.zero,
        width,
        height
    }).render();
}

export function makeBoxHelpers(target: GraphicRenderer, slide: SlideRenderer, scale: number): BoundingBoxMutatorHelpers {
    const box = target.getBoundingBox();
    return {
        box: new BoxRenderer({
            slide: slide,
            scale: scale,
            origin: box.origin,
            width: box.dimensions.x,
            height: box.dimensions.y
        }),
        rotator: new RotatorRenderer({
            slide: slide,
            scale: scale,
            center: box.center.add(new Vector(box.dimensions.x / 2, 0)),
            parent: target
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
            }),
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
    helpers.box.setScale(scale);
    helpers.rotator.setScale(scale);
    helpers.vertices[VERTEX_ROLES.TOP_LEFT].setScale(scale);
    helpers.vertices[VERTEX_ROLES.TOP_RIGHT].setScale(scale);
    helpers.vertices[VERTEX_ROLES.BOTTOM_LEFT].setScale(scale);
    helpers.vertices[VERTEX_ROLES.BOTTOM_RIGHT].setScale(scale);
}

export function resizeBoxHelpers(helpers: BoundingBoxMutatorHelpers, box: BoundingBox): void {
    helpers.box.setOrigin(box.origin);
    helpers.box.setWidth(box.dimensions.x);
    helpers.box.setHeight(box.dimensions.y);
    helpers.rotator.setCenter(box.center.add(new Vector(box.dimensions.x / 2, 0)));
    helpers.vertices[VERTEX_ROLES.TOP_LEFT].setCenter(box.origin);
    helpers.vertices[VERTEX_ROLES.TOP_RIGHT].setCenter(box.origin.add(new Vector(box.dimensions.x, 0)));
    helpers.vertices[VERTEX_ROLES.BOTTOM_LEFT].setCenter(box.origin.add(new Vector(0, box.dimensions.y)));
    helpers.vertices[VERTEX_ROLES.BOTTOM_RIGHT].setCenter(box.origin.add(box.dimensions));
}
