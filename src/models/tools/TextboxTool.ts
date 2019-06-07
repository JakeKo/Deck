import ICanvasTool from "./ICanvasTool";
import Text from "../graphics/Text";
import SlideWrapper from "../../utilities/SlideWrapper";
import CanvasMouseEvent from "../CanvasMouseEvent";

export default class TextboxTool implements ICanvasTool {
    public canvasMouseDown(slideWrapper: SlideWrapper): (event: CustomEvent<CanvasMouseEvent>) => void {
        return function (event: CustomEvent<CanvasMouseEvent>): void {
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

    public canvasMouseOver(slideWrapper: SlideWrapper): () => void {
        return function () {
            slideWrapper.setCursor("text");
        };
    }

    public canvasMouseOut(slideWrapper: SlideWrapper): () => void {
        return function () {
            slideWrapper.setCursor("default");
        };
    }

    public graphicMouseOver(slideWrapper: SlideWrapper): () => void {
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
