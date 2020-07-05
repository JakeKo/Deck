import SlideRenderer from "../rendering/SlideRenderer";
import { AppStore, GETTERS } from "../store/types";
import Vector from "../utilities/Vector";

// TODO: Investigate ways for SlideRenderer to provide all necessary data
export function resolvePosition(event: MouseEvent, slideRenderer: SlideRenderer, store: AppStore): Vector {
    const zoomLevel = store.getters[GETTERS.EDITOR_ZOOM_LEVEL];

    return new Vector(event.pageX, event.pageY)
        .scale(1 / zoomLevel)
        .add(slideRenderer.bounds.origin.scale(-1))
        .add(new Vector(slideRenderer.rawViewbox.x, slideRenderer.rawViewbox.y))
        .transform(Math.round);
}
