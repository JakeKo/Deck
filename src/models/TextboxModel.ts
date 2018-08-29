import { GenerateId } from "../utilities/models";
import TextboxStyleModel from "./TextboxStyleModel";

export default class TextboxModel {
    private _id: string;
    public get id(): string { return this._id; }
    public set id(value: string) { this._id = value; }

    private _x: number;
    public get x(): number { return this._x; }
    public set x(value: number) { this._x = value; }

    private _y: number;
    public get y(): number { return this._y; }
    public set y(value: number) { this._y = value; }

    private _text: string;
    public get text(): string { return this._text; }
    public set text(value: string) { this._text = value; }

    private _styleModel: TextboxStyleModel;
    public get styleModel(): TextboxStyleModel { return this._styleModel; }
    public set styleModel(value: TextboxStyleModel) { this._styleModel = value; }

    constructor(
        { id, x, y, text, styleModel }:
        { id?: string, x?: number, y?: number, text?: string, styleModel?: TextboxStyleModel } = { }
    ) {
        this._id = id || GenerateId();
        this._x = x || 100;
        this._y = y || 100;
        this._text = text || "Lorem Ipsum";
        this._styleModel = styleModel || new TextboxStyleModel();
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
