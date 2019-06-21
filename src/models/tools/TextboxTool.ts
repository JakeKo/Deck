import { ICanvasTool, CustomCanvasMouseEvent, ISlideWrapper } from "../../types";
import { Text } from "../graphics/graphics";

export default class TextboxTool implements ICanvasTool {
    public canvasMouseDown(slideWrapper: ISlideWrapper): (event: CustomCanvasMouseEvent) => void {
        return function (event: CustomCanvasMouseEvent): void {
            slideWrapper.store.commit("focusGraphic", { slideId: slideWrapper.store.getters.activeSlide.id, graphicId: undefined });
            slideWrapper.store.commit("graphicEditorObject", undefined);

            const text: Text = new Text({ origin: slideWrapper.getPosition(event), content: "lorem ipsum\ndolor sit amet", fontSize: 24 });
            slideWrapper.store.commit("addGraphic", { slideId: slideWrapper.slideId, graphic: text });
            slideWrapper.store.commit("focusGraphic", { slideId: slideWrapper.store.getters.activeSlide.id, graphicId: text.id });
            slideWrapper.store.commit("graphicEditorObject", text);
            slideWrapper.store.commit("addSnapVectors", { slideId: slideWrapper.store.getters.activeSlide.id, snapVectors: text.getSnapVectors() });
            slideWrapper.store.commit("tool", "cursor");
            slideWrapper.setCursor("default");
        };
    }

    public canvasMouseOver(slideWrapper: ISlideWrapper): () => void {
        return function () {
            slideWrapper.setCursor("text");
        };
    }

    public canvasMouseOut(slideWrapper: ISlideWrapper): () => void {
        return function () {
            slideWrapper.setCursor("default");
        };
    }

    public graphicMouseOver(slideWrapper: ISlideWrapper): () => void {
        return function () {
            slideWrapper.setCursor("text");
        };
    }

    public graphicMouseOut(): () => void {
        return (): void => { return; };
    }

    public graphicMouseDown(): () => void {
        return (): void => { return; };
    }
}
