import { GenerateId } from "../utilities/models";
import TextboxStyleModel from "./TextboxStyleModel";
import ISlideElement from "./ISlideElement";

export default class TextboxModel implements ISlideElement {
    public id: string;
    public styleModel: TextboxStyleModel;

    private _x: number;
    public get x(): number { return this._x; }
    public set x(value: number) { this._x = value; }

    private _y: number;
    public get y(): number { return this._y; }
    public set y(value: number) { this._y = value; }

    private _text: string;
    public get text(): string { return this._text; }
    public set text(value: string) { this._text = value; }

    constructor(
        { id, x, y, text, styleModel }:
        { id?: string, x?: number, y?: number, text?: string, styleModel?: TextboxStyleModel } = { }
    ) {
        this.id = id || GenerateId();
        this._x = x || 100;
        this._y = y || 100;
        this._text = text || "Lorem Ipsum";
        this.styleModel = styleModel || new TextboxStyleModel();
    }

    public toJson(): string {
        return `
{
    "fill": "${this.styleModel.fill}"
}`;
    }

    public fromJson(jsonString: string): void {
        const json: any = JSON.parse(jsonString);

        this.styleModel.fill = json.fill || "grey";
    }
}
