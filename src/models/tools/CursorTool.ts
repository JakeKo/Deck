import { CustomGraphicMouseEvent, ISlideWrapper, ICanvasTool } from '../../types';
import Utilities from '../../utilities';

export default class CursorTool implements ICanvasTool {
    public canvasMouseOver(): () => void {
        return (): void => { return; };
    }

    public canvasMouseOut(): () => void {
        return (): void => { return; };
    }

    public canvasMouseUp(): () => void {
        return (): void => { return; };
    }

    public canvasMouseDown(slideWrapper: ISlideWrapper): () => void {
        return (): void => {
            slideWrapper.focusGraphic(undefined);
            slideWrapper.store.commit('focusGraphic', { slideId: slideWrapper.slideId, graphicId: undefined });
            slideWrapper.store.commit('graphicEditorGraphicId', undefined);
        };
    }

    public canvasMouseMove(slideWrapper: ISlideWrapper): () => void {
        return (): void => slideWrapper.setCursor('default');
    }

    public graphicMouseOver(): () => void {
        return (): void => { return; };
    }

    public graphicMouseOut(): () => void {
        return (): void => { return; };
    }

    public graphicMouseUp(): () => void {
        return (): void => { return; };
    }

    public graphicMouseDown(slideWrapper: ISlideWrapper): (event: CustomGraphicMouseEvent) => void {
        return Utilities.selectCursorHandler(slideWrapper);
    }

    public graphicMouseMove(slideWrapper: ISlideWrapper): () => void {
        return (): void => slideWrapper.setCursor('pointer');
    }
}
