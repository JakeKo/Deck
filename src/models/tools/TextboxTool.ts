import ICanvasTool from "./ICanvasTool";
import Text from "../Text";
import SlideWrapper from "../../utilities/SlideWrapper";
import Utilities from "../../utilities/general";

export default class RectangleTool implements ICanvasTool {
    public name: string;

    constructor(name: string) {
        this.name = name;
    }

    public canvasMouseDown(slideWrapper: SlideWrapper): (event: CustomEvent) => void {
        return function(event: CustomEvent): void {
            slideWrapper.store.commit("focusGraphic", undefined);
            slideWrapper.store.commit("styleEditorObject", undefined);
    
            const text: Text = new Text({ origin: Utilities.getPosition(event, slideWrapper.store), content: "lorem ipsum\ndolor sit amet", fontSize: 24 });
            slideWrapper.addGraphic(text);
    
            slideWrapper.store.commit("addGraphic", { slideId: slideWrapper.slideId, graphic: text });
            slideWrapper.store.commit("focusGraphic", text);
            slideWrapper.store.commit("styleEditorObject", text);
            slideWrapper.focusGraphic(text.id);
        }
    }

    public canvasMouseOver(slideWrapper: SlideWrapper): () => void {
        return function() {
            slideWrapper.setCursor("text")
        };
    }

    public canvasMouseOut(slideWrapper: SlideWrapper): () => void {
        return function() {
            slideWrapper.setCursor("default")
        };
    }

    public graphicMouseOver(): () => void {
        return function(): void {
            return;
        }
    }

    public graphicMouseOut(): () => void {
        return function(): void {
            return;
        }
    }

    public graphicMouseDown(): () => void {
        return function(): void {
            return;
        }
    }
}