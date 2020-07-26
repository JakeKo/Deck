import { CURVE_EVENTS, ELLIPSE_EVENTS, IMAGE_EVENTS, RECTANGLE_EVENTS, SlideMouseEvent, SLIDE_EVENTS, TEXTBOX_EVENTS, VertexMouseEvent, VERTEX_EVENTS, VIDEO_EVENTS } from "../../events/types";
import { listen, listenOnce, unlisten } from "../../events/utilities";
import { EllipseMutator, ImageMutator, RectangleMutator, TextboxMutator, VideoMutator } from "../../rendering/mutators";
import { GRAPHIC_TYPES } from "../../rendering/types";
import { AppStore } from "../../store/types";
import { EditorTool, TOOL_NAMES } from "../types";
import { moveCurve } from "./curve";
import { moveEllipse, moveEllipseVertex } from "./ellipse";
import { moveImage, moveImageVertex } from "./image";
import { moveRectangle, moveRectangleVertex } from "./rectangle";
import { moveTextbox, moveTextboxVertex } from "./textbox";
import { moveVideo, moveVideoVertex } from "./video";

export default (store: AppStore): EditorTool => {
    return {
        name: TOOL_NAMES.POINTER,
        mount: () => {
            listenOnce(CURVE_EVENTS.MOUSEDOWN, moveCurve);
            listenOnce(ELLIPSE_EVENTS.MOUSEDOWN, moveEllipse);
            listenOnce(IMAGE_EVENTS.MOUSEDOWN, moveImage);
            listenOnce(RECTANGLE_EVENTS.MOUSEDOWN, moveRectangle);
            listenOnce(TEXTBOX_EVENTS.MOUSEDOWN, moveTextbox);
            listenOnce(VERTEX_EVENTS.MOUSEDOWN, moveVertex);
            listenOnce(VIDEO_EVENTS.MOUSEDOWN, moveVideo);

            listen(SLIDE_EVENTS.MOUSEDOWN, reevaluateFocusedGraphics);
            listen(SLIDE_EVENTS.MOUSEMOVE, reevaluateCursor);
        },
        unmount: () => {
            unlisten(CURVE_EVENTS.MOUSEDOWN, moveCurve);
            unlisten(ELLIPSE_EVENTS.MOUSEDOWN, moveEllipse);
            unlisten(IMAGE_EVENTS.MOUSEDOWN, moveImage);
            unlisten(RECTANGLE_EVENTS.MOUSEDOWN, moveRectangle);
            unlisten(TEXTBOX_EVENTS.MOUSEDOWN, moveTextbox);
            unlisten(VERTEX_EVENTS.MOUSEDOWN, moveVertex);
            unlisten(VIDEO_EVENTS.MOUSEDOWN, moveVideo);

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
    } else if (mutator.getType() === GRAPHIC_TYPES.ELLIPSE) {
        moveEllipseVertex(mutator as EllipseMutator, graphic, moveVertex);
    } else if (mutator.getType() === GRAPHIC_TYPES.RECTANGLE) {
        moveRectangleVertex(mutator as RectangleMutator, graphic, moveVertex);
    } else if (mutator.getType() === GRAPHIC_TYPES.TEXTBOX) {
        moveTextboxVertex(mutator as TextboxMutator, graphic, moveVertex);
    } else if (mutator.getType() === GRAPHIC_TYPES.VIDEO) {
        moveVideoVertex(mutator as VideoMutator, graphic, moveVertex);
    }
}
