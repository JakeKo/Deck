import Vector from "../models/Vector";
import SlideRenderer from "../rendering/SlideRenderer";
import { AppState } from "../store/types";
import { Store } from "vuex";

// TODO: Investigate ways for SlideRenderer to provide all necessary data
export function resolvePosition(event: MouseEvent, slideRenderer: SlideRenderer, store: Store<AppState>): Vector {
    return new Vector(event.pageX, event.pageY)
        .scale(1 / store.getters.canvasZoom)
        .add(slideRenderer.bounds.origin.scale(-1))
        .add(store.getters.viewbox.origin)
        .transform(Math.round);
}
