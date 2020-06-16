import { Store } from "vuex";
import { ApplicationState } from "../store/types";
import { SlideMouseEvent } from "../events/types";
import { SLIDE_EVENTS } from "../events/constants";
import { listen, unlisten } from "../events/utilities";
import { resolvePosition } from "./utilities";

type RectangleToolArgs = {
    store: Store<ApplicationState>;
};

class RectangleTool {
    private _store: Store<ApplicationState>;

    constructor(args: RectangleToolArgs) {
        this._store = args.store;
    }

    private _make(event: SlideMouseEvent): void {
        const self = this;
        const { slideRenderer, baseEvent } = event.detail;

        const initialPosition = resolvePosition(baseEvent, slideRenderer, self._store);
        const maker = slideRenderer.startMakingRectangle();
        maker.move(initialPosition);
    
        unlisten(SLIDE_EVENTS.MOUSEDOWN, self._make);
        listen(SLIDE_EVENTS.MOUSEMOVE, update);
        listen(SLIDE_EVENTS.MOUSEUP, complete);
    
        function update(event: SlideMouseEvent): void {
            const { baseEvent } = event.detail;
    
            // TODO: Incorporate shift, alt, ctrl, and snapping into position calculation
            // TODO: Handle ctrl case (symmetric around center)
            const position = resolvePosition(baseEvent, slideRenderer, self._store);
            maker.setDimensions(initialPosition.towards(position));
        }
    
        function complete(): void {
            listen(SLIDE_EVENTS.MOUSEDOWN, self._make);
            unlisten(SLIDE_EVENTS.MOUSEMOVE, update);
            unlisten(SLIDE_EVENTS.MOUSEUP, complete);
        }
    }

    public mount(): void {
        listen(SLIDE_EVENTS.MOUSEDOWN, this._make);
    }

    public unmount(): void {
        unlisten(SLIDE_EVENTS.MOUSEDOWN, this._make);
    }
}

export default RectangleTool;
