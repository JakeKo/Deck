import { CustomCanvasMouseEvent, ISlideWrapper } from "../../types";
import { Text } from "../graphics/graphics";
import CanvasTool from "./CanvasTool";

export default class TextboxTool extends CanvasTool {
    public canvasMouseDown(slideWrapper: ISlideWrapper): (event: CustomCanvasMouseEvent) => void {
        return function (event: CustomCanvasMouseEvent): void {
            slideWrapper.store.commit("focusGraphic", { slideId: slideWrapper.store.getters.activeSlide.id, graphicId: undefined });
            slideWrapper.store.commit("graphicEditorGraphicId", undefined);

            const text: Text = new Text({ origin: slideWrapper.getPosition(event), content: "lorem ipsum\ndolor sit amet", fontSize: 24 });
            slideWrapper.store.commit("addGraphic", { slideId: slideWrapper.slideId, graphic: text });
            slideWrapper.store.commit("focusGraphic", { slideId: slideWrapper.store.getters.activeSlide.id, graphicId: text.id });
            slideWrapper.store.commit("graphicEditorGraphicId", text.id);
            slideWrapper.store.commit("addSnapVectors", { slideId: slideWrapper.store.getters.activeSlide.id, snapVectors: text.getSnapVectors() });
            slideWrapper.store.commit("tool", "cursor");
            slideWrapper.setCursor("default");
        };
    }

    public canvasMouseOver(slideWrapper: ISlideWrapper): () => void {
        return (): void => slideWrapper.setCursor("text");
    }

    public canvasMouseOut(slideWrapper: ISlideWrapper): () => void {
        return (): void => slideWrapper.setCursor("default");
    }

    public graphicMouseOver(slideWrapper: ISlideWrapper): () => void {
        return (): void => slideWrapper.setCursor("text");
    }
}
