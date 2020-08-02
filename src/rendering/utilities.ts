import Vector from '../utilities/Vector';
import { CanvasRenderer, RectangleOutlineRenderer, VertexRenderer } from './helpers';
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
        vertices: {
            [VERTEX_ROLES.TOP_LEFT]: new VertexRenderer({
                slide: slide,
                parent: target,
                center: box.origin,
                scale: scale,
                role: VERTEX_ROLES.TOP_LEFT
            }),
            [VERTEX_ROLES.TOP_RIGHT]: new VertexRenderer({
                slide: slide,
                parent: target,
                center: box.origin.add(new Vector(box.dimensions.x, 0)),
                scale: scale,
                role: VERTEX_ROLES.TOP_RIGHT
            }),
            [VERTEX_ROLES.BOTTOM_LEFT]: new VertexRenderer({
                slide: slide,
                parent: target,
                center: box.origin.add(new Vector(0, box.dimensions.y)),
                scale: scale,
                role: VERTEX_ROLES.BOTTOM_LEFT
            }),
            [VERTEX_ROLES.BOTTOM_RIGHT]: new VertexRenderer({
                slide: slide,
                parent: target,
                center: box.origin.add(box.dimensions),
                scale: scale,
                role: VERTEX_ROLES.BOTTOM_RIGHT
            }),
        },
        box: new RectangleOutlineRenderer({
            slide: slide,
            scale: scale,
            origin: box.origin,
            width: box.dimensions.x,
            height: box.dimensions.y
        })
    };
}

export function renderBoxHelpers(helpers: BoundingBoxMutatorHelpers): void {
    Object.values(helpers.vertices).forEach(helper => helper.render());
    helpers.box.render();
}

export function unrenderBoxHelpers(helpers: BoundingBoxMutatorHelpers): void {
    Object.values(helpers.vertices).forEach(helper => helper.unrender());
    helpers.box.unrender();
}

export function scaleBoxHelpers(helpers: BoundingBoxMutatorHelpers, scale: number): void {
    Object.values(helpers.vertices).forEach(helper => helper.setScale(scale));
    helpers.box.setScale(scale);
}

export function resizeBoxHelpers(helpers: BoundingBoxMutatorHelpers, box: BoundingBox): void {
    helpers.box.setOrigin(box.origin);
    helpers.box.setWidth(box.dimensions.x);
    helpers.box.setHeight(box.dimensions.y);
    helpers.vertices[VERTEX_ROLES.TOP_LEFT].setCenter(box.origin);
    helpers.vertices[VERTEX_ROLES.TOP_RIGHT].setCenter(box.origin.add(new Vector(box.dimensions.x, 0)));
    helpers.vertices[VERTEX_ROLES.BOTTOM_LEFT].setCenter(box.origin.add(new Vector(0, box.dimensions.y)));
    helpers.vertices[VERTEX_ROLES.BOTTOM_RIGHT].setCenter(box.origin.add(box.dimensions));
}
