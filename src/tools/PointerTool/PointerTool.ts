import { dispatch, listen, listenOnce, unlisten } from '@/events';
import {
    CurveAnchorMouseEvent,
    CURVE_ANCHOR_EVENTS,
    CURVE_EVENTS,
    ELLIPSE_EVENTS,
    IMAGE_EVENTS,
    RECTANGLE_EVENTS,
    RotatorMouseEvent,
    ROTATOR_EVENTS,
    SlideKeyboardEvent,
    SlideMouseEvent,
    SlideMouseEventPayload,
    SLIDE_EVENTS,
    TEXTBOX_EVENTS,
    VertexMouseEvent,
    VERTEX_EVENTS,
    VIDEO_EVENTS
} from '@/events/types';
import { GRAPHIC_TYPES } from '@/rendering/types';
import { EditorTool, TOOL_NAMES } from '../types';
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
            listenOnce(CURVE_ANCHOR_EVENTS.MOUSEDOWN, 'moveAnchor', moveAnchor);
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

            listen(VERTEX_EVENTS.MOUSEDOWN, 'moveVertex', moveVertex);
            listen(ROTATOR_EVENTS.MOUSEDOWN, 'rotateGraphic', rotateGraphic);

            listen(SLIDE_EVENTS.MOUSEDOWN, 'reevaluateFocusedGraphics', reevaluateFocusedGraphics);
            listen(SLIDE_EVENTS.MOUSEMOVE, 'reevaluateCursor', reevaluateCursor);
        },
        unmount: () => {
            unlisten(CURVE_EVENTS.MOUSEDOWN, 'curve--init-move');
            unlisten(CURVE_ANCHOR_EVENTS.MOUSEDOWN, 'moveAnchor');
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

            unlisten(VERTEX_EVENTS.MOUSEDOWN, 'moveVertex');
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
    const mutator = slide.focusGraphic(target.parent.id);

    // Handler must be instantiated at the beginning of the mutation to capture initial state
    // Handler cannot be instantiated immediately during each move event
    let lastMouseEvent: VertexMouseEvent | SlideMouseEvent = event;
    const vertexListener = mutator.vertexListener(target.role);
    slide.cursor = 'grabbing';
    slide.cursorLock = true;

    listen(SLIDE_EVENTS.KEYDOWN, 'keyDownHandler', keyDownHandler);
    listen(SLIDE_EVENTS.KEYUP, 'keyUpHandler', keyUpHandler);
    listen(SLIDE_EVENTS.MOUSEMOVE, 'move', move);
    listenOnce(SLIDE_EVENTS.MOUSEUP, 'complete', complete);

    // When Shift, Ctrl, or Alt are pressed or unpressed, simulate a mousemove event
    // This allows the renderer to immediately adjust the shape dimensions if need be
    function keyDownHandler(event: SlideKeyboardEvent): void {
        const { baseEvent } = event.detail;
        if (!['Shift', 'Control', 'Alt'].includes(baseEvent.key)) {
            return;
        }

        const mouseEvent = new MouseEvent('mousemeove', {
            clientX: lastMouseEvent.detail.baseEvent.clientX,
            clientY: lastMouseEvent.detail.baseEvent.clientY,
            shiftKey: baseEvent.key === 'Shift' || lastMouseEvent.detail.baseEvent.shiftKey,
            ctrlKey: baseEvent.key === 'Control' || lastMouseEvent.detail.baseEvent.ctrlKey,
            altKey: baseEvent.key === 'Alt' || lastMouseEvent.detail.baseEvent.altKey
        });

        dispatch<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEMOVE, {
            type: SLIDE_EVENTS.MOUSEMOVE,
            slide: lastMouseEvent.detail.slide,
            baseEvent: mouseEvent,
            target: undefined
        });
    }

    function keyUpHandler(event: SlideKeyboardEvent): void {
        const { baseEvent } = event.detail;
        if (!['Shift', 'Control', 'Alt'].includes(baseEvent.key)) {
            return;
        }

        const mouseEvent = new MouseEvent('mousemeove', {
            clientX: lastMouseEvent.detail.baseEvent.clientX,
            clientY: lastMouseEvent.detail.baseEvent.clientY,
            shiftKey: baseEvent.key !== 'Shift' && lastMouseEvent.detail.baseEvent.shiftKey,
            ctrlKey: baseEvent.key !== 'Control' && lastMouseEvent.detail.baseEvent.ctrlKey,
            altKey: baseEvent.key !== 'Alt' && lastMouseEvent.detail.baseEvent.altKey
        });

        dispatch<SlideMouseEventPayload>(SLIDE_EVENTS.MOUSEMOVE, {
            type: SLIDE_EVENTS.MOUSEMOVE,
            slide: lastMouseEvent.detail.slide,
            baseEvent: mouseEvent,
            target: undefined
        });
    }

    function move(event: SlideMouseEvent): void {
        vertexListener(event);
        slide.broadcastSetGraphic(mutator.target);
        lastMouseEvent = event;
    }

    function complete(event: SlideMouseEvent): void {
        vertexListener(event);
        slide.broadcastSetGraphic(mutator.target);

        slide.cursorLock = false;
        slide.cursor = 'grab';

        unlisten(SLIDE_EVENTS.MOUSEMOVE, 'move');
        unlisten(SLIDE_EVENTS.KEYDOWN, 'keyDownHandler');
        unlisten(SLIDE_EVENTS.KEYUP, 'keyUpHandler');
    }
}

function rotateGraphic(event: RotatorMouseEvent): void {
    const { parentId, slide } = event.detail;
    const mutator = slide.focusGraphic(parentId);

    // Handler must be instantiated at the beginning of the mutation to capture initial state
    // Handler cannot be instantiated immediately during each move event
    const rotateListener = mutator.rotateListener();
    slide.cursor = 'grabbing';
    slide.cursorLock = true;

    listen(SLIDE_EVENTS.MOUSEMOVE, 'rotate', rotate);
    listenOnce(SLIDE_EVENTS.MOUSEUP, 'complete', complete);

    function rotate(event: SlideMouseEvent): void {
        rotateListener(event);
        slide.broadcastSetGraphic(mutator.target);
    }

    function complete(event: SlideMouseEvent): void {
        rotateListener(event);
        slide.broadcastSetGraphic(mutator.target);

        slide.cursorLock = false;
        slide.cursor = 'grab';

        unlisten(SLIDE_EVENTS.MOUSEMOVE, 'rotate');
    }
}

function moveAnchor(event: CurveAnchorMouseEvent): void {
    moveCurveAnchor(event, moveAnchor);
}
