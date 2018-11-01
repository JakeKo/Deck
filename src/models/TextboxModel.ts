import Utilities from "../utilities/Utilities";
import TextboxStyleModel from "./TextboxStyleModel";
import ISlideElement from "./ISlideElement";

export default class TextboxModel implements ISlideElement {
    public id: string;
    public styleModel: TextboxStyleModel;
    public x: number;
    public y: number;
    public text: string;

    constructor(
        { id, x, y, text, styleModel }:
        { id?: string, x?: number, y?: number, text?: string, styleModel?: TextboxStyleModel } = { }
    ) {
        this.id = id || Utilities.generateId();
        this.x = x || 100;
        this.y = y || 100;
        this.text = text || "Lorem Ipsum";
        this.styleModel = styleModel || new TextboxStyleModel();
    }

    public fromJson(jsonString: string): void {
        const json: any = JSON.parse(jsonString);

        this.styleModel.fill = json.fill || "grey";
        this.text = json.text || "";
        this.x = json.x || 100;
        this.y = json.y || 100;
    }
}
