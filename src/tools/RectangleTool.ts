import { Store } from "vuex";
import { ApplicationState } from "../store/types";
import { SlideMouseEvent } from "../events/types";
import Vector from "../models/Vector";
import { SLIDE_EVENTS } from "../events/constants";
import { listen, unlisten } from "../events/utilities";

function make(event: SlideMouseEvent): void {
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
        // TODO: Handle ctrl case (symmetric around center)
        const position = new Vector(baseEvent.clientX, baseEvent.clientY);
        maker.setDimensions(initialPosition.towards(position));
    }

    function complete(): void {
        listen(SLIDE_EVENTS.MOUSEDOWN, make);
        unlisten(SLIDE_EVENTS.MOUSEMOVE, update);
        unlisten(SLIDE_EVENTS.MOUSEUP, complete);
    }
};

// TODO: Find more elegant method of using store types
export function mount(store: Store<ApplicationState>): void {
    listen(SLIDE_EVENTS.MOUSEDOWN, make);
};

export function unmount(): void {
    unlisten(SLIDE_EVENTS.MOUSEDOWN, make);
};
