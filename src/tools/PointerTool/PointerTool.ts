import { listen, listenOnce, unlisten } from '@/events';
import {
    CURVE_ANCHOR_EVENTS,
    CURVE_EVENTS,
    ELLIPSE_EVENTS,
    IMAGE_EVENTS,
    RECTANGLE_EVENTS,
    RotatorMouseEvent,
    ROTATOR_EVENTS,
    SlideKeyboardEvent,
    SlideMouseEvent,
    SLIDE_EVENTS,
    TEXTBOX_EVENTS,
    VertexMouseEvent,
    VERTEX_EVENTS,
    VIDEO_EVENTS
} from '@/events/types';
import { GRAPHIC_TYPES } from '@/rendering/types';
import { EditorTool, TOOL_NAMES } from '../types';
import { mouseEventFromKeyDownEvent, mouseEventFromKeyUpEvent } from '../utilities';
import { hoverCurve, moveCurve, moveCurveAnchor } from './curve';
import { hoverEllipse, moveEllipse } from './ellipse';
import { hoverImage, moveImage } from './image';
import { hoverRectangle, moveRectangle } from './rectangle';
import { hoverTextbox, moveTextbox } from './textbox';
import { hoverVideo, moveVideo } from './video';

export default (): EditorTool => {
    return {
        name: TOOL_NAMES.POINTER,
        mount: () => {
            listenOnce(CURVE_EVENTS.MOUSEDOWN, 'curve--init-move', moveCurve);
            listenOnce(CURVE_ANCHOR_EVENTS.MOUSEDOWN, 'curve-anchor--init-move', moveCurveAnchor);
            listenOnce(ELLIPSE_EVENTS.MOUSEDOWN, 'ellipse--init-move', moveEllipse);
            listenOnce(IMAGE_EVENTS.MOUSEDOWN, 'image--init-move', moveImage);
            listenOnce(RECTANGLE_EVENTS.MOUSEDOWN, 'rectangle--init-move', moveRectangle);
            listenOnce(TEXTBOX_EVENTS.MOUSEDOWN, 'textbox--init-move', moveTextbox);
            listenOnce(VIDEO_EVENTS.MOUSEDOWN, 'video--init-move', moveVideo);

            listen(CURVE_EVENTS.MOUSEOVER, 'hoverCurve', hoverCurve);
            listen(ELLIPSE_EVENTS.MOUSEOVER, 'hoverEllipse', hoverEllipse);
            listen(IMAGE_EVENTS.MOUSEOVER, 'hoverImage', hoverImage);
            listen(RECTANGLE_EVENTS.MOUSEOVER, 'hoverRectangle', hoverRectangle);
            listen(TEXTBOX_EVENTS.MOUSEOVER, 'hoverTextbox', hoverTextbox);
            listen(VIDEO_EVENTS.MOUSEOVER, 'hoverVideo', hoverVideo);

            listenOnce(VERTEX_EVENTS.MOUSEDOWN, 'vertex--init-move', moveVertex);
            listen(ROTATOR_EVENTS.MOUSEDOWN, 'rotateGraphic', rotateGraphic);

            listen(SLIDE_EVENTS.MOUSEDOWN, 'reevaluateFocusedGraphics', reevaluateFocusedGraphics);
            listen(SLIDE_EVENTS.MOUSEMOVE, 'reevaluateCursor', reevaluateCursor);
        },
        unmount: () => {
            unlisten(CURVE_EVENTS.MOUSEDOWN, 'curve--init-move');
            unlisten(CURVE_ANCHOR_EVENTS.MOUSEDOWN, 'curve-anchor--init-move');
            unlisten(ELLIPSE_EVENTS.MOUSEDOWN, 'ellipse--init-move');
            unlisten(IMAGE_EVENTS.MOUSEDOWN, 'image--init-move');
            unlisten(RECTANGLE_EVENTS.MOUSEDOWN, 'rectangle--init-move');
            unlisten(TEXTBOX_EVENTS.MOUSEDOWN, 'textbox--init-move');
            unlisten(VIDEO_EVENTS.MOUSEDOWN, 'video--init-move');

            unlisten(CURVE_EVENTS.MOUSEOVER, 'hoverCurve');
            unlisten(ELLIPSE_EVENTS.MOUSEOVER, 'hoverEllipse');
            unlisten(IMAGE_EVENTS.MOUSEOVER, 'hoverImage');
            unlisten(RECTANGLE_EVENTS.MOUSEOVER, 'hoverRectangle');
            unlisten(TEXTBOX_EVENTS.MOUSEOVER, 'hoverTextbox');
            unlisten(VIDEO_EVENTS.MOUSEOVER, 'hoverVideo');

            unlisten(VERTEX_EVENTS.MOUSEDOWN, 'vertex--init-move');
            unlisten(ROTATOR_EVENTS.MOUSEDOWN, 'rotateGraphic');

            unlisten(SLIDE_EVENTS.MOUSEDOWN, 'reevaluateFocusedGraphics');
            unlisten(SLIDE_EVENTS.MOUSEMOVE, 'reevaluateCursor');
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
        const type = target.type;
        if ([GRAPHIC_TYPES.VERTEX, GRAPHIC_TYPES.CURVE_ANCHOR, GRAPHIC_TYPES.ROTATOR].indexOf(type) !== -1) {
            slide.cursor = 'grab';
        } else if ([GRAPHIC_TYPES.CURVE, GRAPHIC_TYPES.ELLIPSE, GRAPHIC_TYPES.IMAGE, GRAPHIC_TYPES.RECTANGLE, GRAPHIC_TYPES.TEXTBOX, GRAPHIC_TYPES.VIDEO].indexOf(type) !== -1) {
            slide.cursor = 'move';
        } else {
            slide.cursor = 'default';
        }
    }
}

function moveVertex(event: VertexMouseEvent): void {
    const { slide, target } = event.detail;
    const { id: graphicId, type: graphicType } = target.parent;
    const mutator = slide.focusGraphic(graphicId);

    // Handler must be instantiated at the beginning of the mutation to capture initial state
    // Handler cannot be instantiated immediately during each move event
    let lastMouseEvent: VertexMouseEvent | SlideMouseEvent = event;
    const vertexListener = mutator.initVertexMove(target.role);
    slide.lockCursor('grabbing');

    listen(SLIDE_EVENTS.KEYDOWN, 'vertex--key-down', keyDownHandler);
    listen(SLIDE_EVENTS.KEYUP, 'vertex--key-up', keyUpHandler);
    listen(SLIDE_EVENTS.MOUSEMOVE, 'vertex--move', move);
    listenOnce(SLIDE_EVENTS.MOUSEUP, 'vertex--complete', complete);

    function keyDownHandler(event: SlideKeyboardEvent): void {
        mouseEventFromKeyDownEvent(event, lastMouseEvent);
    }

    function keyUpHandler(event: SlideKeyboardEvent): void {
        mouseEventFromKeyUpEvent(event, lastMouseEvent);
    }

    function move(event: SlideMouseEvent): void {
        const deltas = vertexListener(event);
        slide.setProps(graphicId, graphicType, deltas);
        lastMouseEvent = event;
    }

    function complete(event: SlideMouseEvent): void {
        move(event);
        mutator.endVertexMove();
        slide.unlockCursor('grab');

        unlisten(SLIDE_EVENTS.MOUSEMOVE, 'vertex--move');
        unlisten(SLIDE_EVENTS.KEYDOWN, 'vertex--key-down');
        unlisten(SLIDE_EVENTS.KEYUP, 'vertex--key-up');
        listenOnce(VERTEX_EVENTS.MOUSEDOWN, 'vertex--init-move', moveVertex);
    }
}

function rotateGraphic(event: RotatorMouseEvent): void {
    const { parentId, slide } = event.detail;
    const { id: graphicId, type: graphicType } = slide.getGraphic(parentId);
    const mutator = slide.focusGraphic(graphicId);

    // Handler must be instantiated at the beginning of the mutation to capture initial state
    // Handler cannot be instantiated immediately during each move event
    let lastMouseEvent: RotatorMouseEvent | SlideMouseEvent = event;
    const rotateListener = mutator.initRotate();
    slide.lockCursor('grabbing');

    listen(SLIDE_EVENTS.KEYDOWN, 'rotator--key-down', keyDownHandler);
    listen(SLIDE_EVENTS.KEYUP, 'rotator--key-up', keyUpHandler);
    listen(SLIDE_EVENTS.MOUSEMOVE, 'rotate', rotate);
    listenOnce(SLIDE_EVENTS.MOUSEUP, 'complete', complete);

    function keyDownHandler(event: SlideKeyboardEvent): void {
        mouseEventFromKeyDownEvent(event, lastMouseEvent);
    }

    function keyUpHandler(event: SlideKeyboardEvent): void {
        mouseEventFromKeyUpEvent(event, lastMouseEvent);
    }

    function rotate(event: SlideMouseEvent): void {
        const deltas = rotateListener(event);
        slide.setProps(graphicId, graphicType, deltas);
        lastMouseEvent = event;
    }

    function complete(event: SlideMouseEvent): void {
        rotate(event);
        mutator.endRotate();
        slide.unlockCursor('grab');

        unlisten(SLIDE_EVENTS.MOUSEMOVE, 'rotate');
    }
}
