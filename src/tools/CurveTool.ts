import { listen, listenOnce, unlisten } from '@/events';
import { SlideKeyboardEvent, SlideMouseEvent, SLIDE_EVENTS } from '@/events/types';
import { GRAPHIC_TYPES, ICurveCreator } from '@/rendering/types';
import { AppStore } from '@/store/types';
import { provideId } from '@/utilities/IdProvider';
import { PointerTool } from '.';
import { EditorTool, TOOL_NAMES } from './types';

export default (store: AppStore): EditorTool => {
    function make(event: SlideMouseEvent): void {
        const { slide } = event.detail;
        const graphicId = provideId();
        const maker = slide.initInteractiveCreate(graphicId, GRAPHIC_TYPES.CURVE) as ICurveCreator;
        slide.createGraphic(maker.create({}));
        slide.setProps(graphicId, GRAPHIC_TYPES.CURVE, maker.addAnchor(event));

        const drawHandler = maker.initDraw();
        let createAnchorHandler: ReturnType<typeof maker.initCreateAnchor>;

        setPoint();
        listen(SLIDE_EVENTS.KEYDOWN, 'curve--complete', complete);

        function movePoint(event: SlideMouseEvent): void {
            const deltas = drawHandler(event);
            slide.setProps(graphicId, GRAPHIC_TYPES.CURVE, deltas);
        }

        function setPoint(): void {
            createAnchorHandler = maker.initCreateAnchor();

            unlisten(SLIDE_EVENTS.MOUSEMOVE, 'curve--move-point');
            listen(SLIDE_EVENTS.MOUSEMOVE, 'curve--move-handles', moveHandles);
            listenOnce(SLIDE_EVENTS.MOUSEUP, 'curve--set-handles', setHandles);
        }

        function moveHandles(event: SlideMouseEvent): void {
            const deltas = createAnchorHandler?.(event);
            slide.setProps(graphicId, GRAPHIC_TYPES.CURVE, deltas);
        }

        function setHandles(event: SlideMouseEvent): void {
            const deltas = createAnchorHandler(event);
            slide.setProps(graphicId, GRAPHIC_TYPES.CURVE, deltas);
            maker.endCreateAnchor();

            slide.setProps(graphicId, GRAPHIC_TYPES.CURVE, maker.addAnchor(event));

            unlisten(SLIDE_EVENTS.MOUSEMOVE, 'curve--move-handles');
            listen(SLIDE_EVENTS.MOUSEMOVE, 'curve--move-point', movePoint);
            listenOnce(SLIDE_EVENTS.MOUSEDOWN, 'curve--setPoint', setPoint);
        }

        function complete(event: SlideKeyboardEvent): void {
            if (['Enter', 'Escape'].indexOf(event.detail.baseEvent.key) === -1) {
                return;
            }

            const deltas = maker.endDraw();
            slide.setProps(graphicId, GRAPHIC_TYPES.CURVE, deltas);

            unlisten(SLIDE_EVENTS.MOUSEMOVE, 'curve--move-point');
            unlisten(SLIDE_EVENTS.MOUSEDOWN, 'curve--setPoint');
            unlisten(SLIDE_EVENTS.MOUSEMOVE, 'curve--move-handles');
            unlisten(SLIDE_EVENTS.MOUSEUP, 'curve--set-handles');
            unlisten(SLIDE_EVENTS.KEYDOWN, 'curve--complete');

            store.mutations.setActiveTool(PointerTool());
        }
    }

    return {
        name: TOOL_NAMES.CURVE,
        mount: () => listenOnce(SLIDE_EVENTS.MOUSEDOWN, 'make', make),
        unmount: () => unlisten(SLIDE_EVENTS.MOUSEDOWN, 'make')
    };
};
