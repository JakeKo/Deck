import { Store } from "vuex";
import { ApplicationState } from "../store/types";
import { SlideMouseEvent } from "../events/types";
import Vector from "../models/Vector";
import { SLIDE_EVENTS } from "../events/constants";
import { listen, unlisten } from "../events/utilities";

const make: (event: SlideMouseEvent) => void = event => {
    const { slideRenderer, baseEvent } = event.detail;

    // TODO: Implement method for resolving true position on slide
    const initialPosition = new Vector(baseEvent.clientX, baseEvent.clientY);
    const maker = slideRenderer.startMakingRectangle();
    maker.move(initialPosition);

    unlisten(SLIDE_EVENTS.MOUSEDOWN, make);
    listen(SLIDE_EVENTS.MOUSEMOVE, update);
    listen(SLIDE_EVENTS.MOUSEUP, complete);

    function update(event: SlideMouseEvent): void {
        const { baseEvent } = event.detail;

        // TODO: Incorporate shift, alt, ctrl, and snapping into position calculation
        const position = new Vector(baseEvent.clientX, baseEvent.y);
        maker.setDimensions(initialPosition.towards(position));
    }

    function complete(): void {
        listen(SLIDE_EVENTS.MOUSEDOWN, make);
        unlisten(SLIDE_EVENTS.MOUSEMOVE, update);
        unlisten(SLIDE_EVENTS.MOUSEUP, complete);
    }
};

// TODO: Find more elegant method of using store types
export const mount: (store: Store<ApplicationState>) => void = store => {
    listen(SLIDE_EVENTS.MOUSEDOWN, make);
};

export const unmount: () => void = () => {

};
