import { GenerateId } from "../utilities/models";
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
        this.id = id || GenerateId();
        this.x = x || 100;
        this.y = y || 100;
        this.text = text || "Lorem Ipsum";
        this.styleModel = styleModel || new TextboxStyleModel();
    }

    public toJson(): string {
        return `
{
    "fill": "${this.styleModel.fill}",
    "text": "${this.text}",
    "x": ${this.x},
    "y": ${this.y}
}`;
    }

    public fromJson(jsonString: string): void {
        const json: any = JSON.parse(jsonString);

        this.styleModel.fill = json.fill || "grey";
        this.text = json.text || "";
        this.x = json.x || 100;
        this.y = json.y || 100;
    }
}
