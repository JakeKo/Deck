import { ELLIPSE_EVENTS, RECTANGLE_EVENTS, SlideMouseEvent, SLIDE_EVENTS, VertexMouseEvent, VERTEX_EVENTS, IMAGE_EVENTS } from "../../events/types";
import { listen, listenOnce, unlisten } from "../../events/utilities";
import { RectangleMutator, ImageMutator } from "../../rendering/mutators";
import { GRAPHIC_TYPES } from "../../rendering/types";
import { AppStore } from "../../store/types";
import { EditorTool, TOOL_NAMES } from "../types";
import { moveEllipse } from "./ellipse";
import { moveRectangle, moveRectangleVertex } from "./rectangle";
import { moveImage, moveImageVertex } from "./image";

export default (store: AppStore): EditorTool => {
    return {
        name: TOOL_NAMES.POINTER,
        mount: () => {
            listenOnce(ELLIPSE_EVENTS.MOUSEDOWN, moveEllipse);
            listenOnce(IMAGE_EVENTS.MOUSEDOWN, moveImage);
            listenOnce(RECTANGLE_EVENTS.MOUSEDOWN, moveRectangle);
            listenOnce(VERTEX_EVENTS.MOUSEDOWN, moveVertex);

            listen(SLIDE_EVENTS.MOUSEDOWN, reevaluateFocusedGraphics);
            listen(SLIDE_EVENTS.MOUSEMOVE, reevaluateCursor);
        },
        unmount: () => {
            unlisten(ELLIPSE_EVENTS.MOUSEDOWN, moveEllipse);
            unlisten(IMAGE_EVENTS.MOUSEDOWN, moveImage);
            unlisten(RECTANGLE_EVENTS.MOUSEDOWN, moveRectangle);
            unlisten(VERTEX_EVENTS.MOUSEDOWN, moveVertex);

            unlisten(SLIDE_EVENTS.MOUSEDOWN, reevaluateFocusedGraphics);
            unlisten(SLIDE_EVENTS.MOUSEMOVE, reevaluateCursor);
        }
    };
};

function reevaluateFocusedGraphics(event: SlideMouseEvent): void {
    const { slide, target } = event.detail;

    if (target === undefined) {
        slide.unfocusAllGraphics();
    }
}

function reevaluateCursor(event: SlideMouseEvent): void {
    const { slide, target } = event.detail;
    slide.setCursor(target === undefined ? 'default' : 'move');
}

function moveVertex(event: VertexMouseEvent): void {
    const { slide, graphic } = event.detail;
    const mutator = slide.focusGraphic(graphic.getParent().getId());

    if (mutator.getType() === GRAPHIC_TYPES.IMAGE) {
        moveImageVertex(mutator as ImageMutator, graphic, moveVertex);
    } else if (mutator.getType() === GRAPHIC_TYPES.RECTANGLE) {
        moveRectangleVertex(mutator as RectangleMutator, graphic, moveVertex);
    }
}
