import { CurveAnchorMouseEvent, CURVE_ANCHOR_EVENTS, CURVE_EVENTS, ELLIPSE_EVENTS, IMAGE_EVENTS, RECTANGLE_EVENTS, SlideMouseEvent, SLIDE_EVENTS, TEXTBOX_EVENTS, VertexMouseEvent, VERTEX_EVENTS, VIDEO_EVENTS, RotatorMouseEvent, ROTATOR_EVENTS } from "../../events/types";
import { listen, listenOnce, unlisten } from "../../events/utilities";
import { GRAPHIC_TYPES } from "../../rendering/types";
import { AppStore } from "../../store/types";
import { EditorTool, TOOL_NAMES } from "../types";
import { hoverCurve, moveCurve, moveCurveAnchor } from "./curve";
import { hoverEllipse, moveEllipse } from "./ellipse";
import { hoverImage, moveImage } from "./image";
import { hoverRectangle, moveRectangle } from "./rectangle";
import { hoverTextbox, moveTextbox } from "./textbox";
import { hoverVideo, moveVideo } from "./video";

export default (store: AppStore): EditorTool => {
    return {
        name: TOOL_NAMES.POINTER,
        mount: () => {
            listenOnce(CURVE_EVENTS.MOUSEDOWN, moveCurve);
            listenOnce(CURVE_ANCHOR_EVENTS.MOUSEDOWN, moveAnchor);
            listenOnce(ELLIPSE_EVENTS.MOUSEDOWN, moveEllipse);
            listenOnce(IMAGE_EVENTS.MOUSEDOWN, moveImage);
            listenOnce(RECTANGLE_EVENTS.MOUSEDOWN, moveRectangle);
            listenOnce(TEXTBOX_EVENTS.MOUSEDOWN, moveTextbox);
            listenOnce(VERTEX_EVENTS.MOUSEDOWN, moveVertex);
            listenOnce(VIDEO_EVENTS.MOUSEDOWN, moveVideo);

            listen(CURVE_EVENTS.MOUSEOVER, hoverCurve);
            listen(ELLIPSE_EVENTS.MOUSEOVER, hoverEllipse);
            listen(IMAGE_EVENTS.MOUSEOVER, hoverImage);
            listen(RECTANGLE_EVENTS.MOUSEOVER, hoverRectangle);
            listen(TEXTBOX_EVENTS.MOUSEOVER, hoverTextbox);
            listen(VIDEO_EVENTS.MOUSEOVER, hoverVideo);

            listen(ROTATOR_EVENTS.MOUSEDOWN, rotateGraphic);

            listen(SLIDE_EVENTS.MOUSEDOWN, reevaluateFocusedGraphics);
            listen(SLIDE_EVENTS.MOUSEMOVE, reevaluateCursor);
        },
        unmount: () => {
            unlisten(CURVE_EVENTS.MOUSEDOWN, moveCurve);
            unlisten(CURVE_ANCHOR_EVENTS.MOUSEDOWN, moveAnchor);
            unlisten(ELLIPSE_EVENTS.MOUSEDOWN, moveEllipse);
            unlisten(IMAGE_EVENTS.MOUSEDOWN, moveImage);
            unlisten(RECTANGLE_EVENTS.MOUSEDOWN, moveRectangle);
            unlisten(TEXTBOX_EVENTS.MOUSEDOWN, moveTextbox);
            unlisten(VERTEX_EVENTS.MOUSEDOWN, moveVertex);
            unlisten(VIDEO_EVENTS.MOUSEDOWN, moveVideo);

            unlisten(CURVE_EVENTS.MOUSEOVER, hoverCurve);
            unlisten(ELLIPSE_EVENTS.MOUSEOVER, hoverEllipse);
            unlisten(IMAGE_EVENTS.MOUSEOVER, hoverImage);
            unlisten(RECTANGLE_EVENTS.MOUSEOVER, hoverRectangle);
            unlisten(TEXTBOX_EVENTS.MOUSEOVER, hoverTextbox);
            unlisten(VIDEO_EVENTS.MOUSEOVER, hoverVideo);

            unlisten(ROTATOR_EVENTS.MOUSEDOWN, rotateGraphic);

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

    if (target === undefined) {
        slide.cursor = 'default';
    } else {
        const type = target.getType();
        if ([GRAPHIC_TYPES.VERTEX, GRAPHIC_TYPES.CURVE_ANCHOR].indexOf(type) !== -1) {
            slide.cursor = 'grab';
        } else if ([GRAPHIC_TYPES.CURVE, GRAPHIC_TYPES.ELLIPSE, GRAPHIC_TYPES.IMAGE, GRAPHIC_TYPES.RECTANGLE, GRAPHIC_TYPES.TEXTBOX, GRAPHIC_TYPES.VIDEO].indexOf(type) !== -1) {
            slide.cursor = 'move';
        } else {
            slide.cursor = 'default';
        }
    }
}

function moveVertex(event: VertexMouseEvent): void {
    const { slide, graphic } = event.detail;
    const mutator = slide.focusGraphic(graphic.getParent().getId());

    // Handler must be instantiated at the beginning of the mutation to capture initial state
    // Handler cannot be instantiated immediately during each move event
    const handler = mutator.vertexListener(graphic.getRole());
    slide.cursor = 'grabbing';
    slide.cursorLock = true;

    listen(SLIDE_EVENTS.MOUSEMOVE, move);
    listenOnce(SLIDE_EVENTS.MOUSEUP, complete);

    function move(event: SlideMouseEvent): void {
        handler(event);
        slide.broadcastSetGraphic(mutator.getTarget());
    }

    function complete(): void {
        slide.cursorLock = false;
        slide.cursor = 'grab';

        unlisten(SLIDE_EVENTS.MOUSEMOVE, move);
        listenOnce(VERTEX_EVENTS.MOUSEDOWN, moveVertex);
    }
}

function rotateGraphic(event: RotatorMouseEvent): void {
    const { parentId, slide } = event.detail;
    const mutator = slide.focusGraphic(parentId);
    const rotateListener = mutator.rotateListener();

    listen(SLIDE_EVENTS.MOUSEMOVE, rotate);
    listenOnce(SLIDE_EVENTS.MOUSEUP, complete);

    function rotate(event: SlideMouseEvent): void {
        rotateListener(event);
        slide.broadcastSetGraphic(mutator.getTarget());
    }

    function complete(): void {
        unlisten(SLIDE_EVENTS.MOUSEMOVE, rotate);
    }
}

function moveAnchor(event: CurveAnchorMouseEvent): void {
    moveCurveAnchor(event, moveAnchor);
}
