import Vector from "../utilities/Vector";
import SlideRenderer from "../rendering/SlideRenderer";

// TODO: Investigate ways for SlideRenderer to provide all necessary data
export function resolvePosition(event: MouseEvent, slideRenderer: SlideRenderer, store: any): Vector {
    const { editorZoomLevel, rawEditorViewbox } = store.getters;

    return new Vector(event.pageX, event.pageY)
        .scale(1 / editorZoomLevel)
        .add(slideRenderer.bounds.origin.scale(-1))
        .add(new Vector(rawEditorViewbox.x, rawEditorViewbox.y))
        .transform(Math.round);
}
