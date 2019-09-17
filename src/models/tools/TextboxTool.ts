import { CustomCanvasMouseEvent, ISlideWrapper, ICanvasTool } from '../../types';
import { Text } from '../graphics/graphics';

export default class TextboxTool implements ICanvasTool {
    public canvasMouseOver(): () => void {
        return (): void => { return; };
    }

    public canvasMouseOut(): () => void {
        return (): void => { return; };
    }

    public canvasMouseUp(): () => void {
        return (): void => { return; };
    }

    public canvasMouseDown(slideWrapper: ISlideWrapper): (event: CustomCanvasMouseEvent) => void {
        return function (event: CustomCanvasMouseEvent): void {
            slideWrapper.store.commit('focusGraphic', { slideId: slideWrapper.store.getters.activeSlide.id, graphicId: undefined });
            slideWrapper.store.commit('graphicEditorGraphicId', undefined);

            const text: Text = new Text({ origin: slideWrapper.getPosition(event), content: 'lorem ipsum\ndolor sit amet', fontSize: 24 });
            slideWrapper.store.commit('addGraphic', { slideId: slideWrapper.slideId, graphic: text });
            slideWrapper.addGraphic(text);
            slideWrapper.focusGraphic(text);
            slideWrapper.store.commit('focusGraphic', { slideId: slideWrapper.store.getters.activeSlide.id, graphicId: text.id });
            slideWrapper.store.commit('graphicEditorGraphicId', text.id);
            slideWrapper.store.commit('addSnapVectors', { slideId: slideWrapper.store.getters.activeSlide.id, snapVectors: text.getSnapVectors() });
            slideWrapper.store.commit('tool', 'cursor');
            slideWrapper.setCursor('default');
        };
    }

    public canvasMouseMove(): () => void {
        return (): void => { return; };
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

    public graphicMouseDown(): () => void {
        return (): void => { return; };
    }

    public graphicMouseMove(): () => void {
        return (): void => { return; };
    }
}
