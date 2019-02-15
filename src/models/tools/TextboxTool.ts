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
            slideWrapper.focusGraphic(undefined);
            slideWrapper.store.commit("focusGraphic", undefined);
            slideWrapper.store.commit("styleEditorObject", undefined);

            const text: Text = new Text({ origin: Utilities.getPosition(event, slideWrapper.store), content: "lorem ipsum\ndolor sit amet", fontSize: 24 });
            slideWrapper.addGraphic(text);

            slideWrapper.store.commit("addGraphic", { slideId: slideWrapper.slideId, graphic: text });
            slideWrapper.store.commit("focusGraphic", text);
            slideWrapper.store.commit("styleEditorObject", text);
            slideWrapper.focusGraphic(text.id);
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