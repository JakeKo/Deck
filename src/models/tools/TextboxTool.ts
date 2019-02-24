import ICanvasTool from "./ICanvasTool";
import Text from "../graphics/Text";
import SlideWrapper from "../../utilities/SlideWrapper";
import Utilities from "../../utilities/general";

export default class TextboxTool implements ICanvasTool {
    public name: string;

    private noop: () => void = (): void => { return; };
    private cursor: string = "text";
    private defaultCursor: string = "default";

    constructor(name: string) {
        this.name = name;
    }

    public canvasMouseDown(slideWrapper: SlideWrapper): (event: CustomEvent) => void {
        this.noop();
        return function (event: CustomEvent): void {
            slideWrapper.store.commit("focusGraphic", { slideId: slideWrapper.store.getters.activeSlide.id, graphicId: undefined });
            slideWrapper.store.commit("styleEditorObject", undefined);

            const text: Text = new Text({ origin: Utilities.getPosition(event, slideWrapper), content: "lorem ipsum\ndolor sit amet", fontSize: 24 });
            slideWrapper.store.commit("addGraphic", { slideId: slideWrapper.slideId, graphic: text });
            slideWrapper.store.commit("focusGraphic", { slideId: slideWrapper.store.getters.activeSlide.id, graphicId: text.id });
            slideWrapper.store.commit("styleEditorObject", text);
        };
    }

    public canvasMouseOver(slideWrapper: SlideWrapper): () => void {
        const self: TextboxTool = this;
        return function () {
            slideWrapper.setCursor(self.cursor);
        };
    }

    public canvasMouseOut(slideWrapper: SlideWrapper): () => void {
        const self: TextboxTool = this;
        return function () {
            slideWrapper.setCursor(self.defaultCursor);
        };
    }

    public graphicMouseOver(slideWrapper: SlideWrapper): () => void {
        const self: TextboxTool = this;
        return function () {
            slideWrapper.setCursor(self.cursor);
        };
    }

    public graphicMouseOut(): () => void {
        return this.noop;
    }

    public graphicMouseDown(): () => void {
        return this.noop;
    }
}
