import { Store } from "vuex";
import { ApplicationState } from "../store/types";
import { SlideMouseEventPayload } from "../rendering/types";
import Vector from "../models/Vector";
import { SLIDE_EVENTS } from "../rendering/constants";

const make: (event: CustomEvent<SlideMouseEventPayload>) => void = event => {
    const { slideRenderer, baseEvent } = event.detail;

    // TODO: Implement method for resolving true position on slide
    const initialPosition = new Vector(baseEvent.clientX, baseEvent.clientY);
    const maker = slideRenderer.startMakingRectangle();
    maker.move(initialPosition);

    document.removeEventListener(SLIDE_EVENTS.MOUSEDOWN, make as EventListener);
    document.addEventListener(SLIDE_EVENTS.MOUSEMOVE, update as EventListener);
    document.addEventListener(SLIDE_EVENTS.MOUSEUP, complete as EventListener);

    function update(event: CustomEvent<SlideMouseEventPayload>): void {
        const { baseEvent } = event.detail;

        // TODO: Incorporate shift, alt, ctrl, and snapping into position calculation
        const position = new Vector(baseEvent.clientX, baseEvent.y);
        maker.setDimensions(initialPosition.towards(position));
    }

    function complete(): void {
        document.addEventListener(SLIDE_EVENTS.MOUSEDOWN, make as EventListener);
        document.removeEventListener(SLIDE_EVENTS.MOUSEMOVE, update as EventListener);
        document.removeEventListener(SLIDE_EVENTS.MOUSEUP, complete as EventListener);
    }
};

// TODO: Find more elegant method of using store types
export const mount: (store: Store<ApplicationState>) => void = store => {
    document.addEventListener(SLIDE_EVENTS.MOUSEDOWN, make as EventListener)
};

export const unmount: () => void = () => {

};
