import { GenerateId } from "../utilities/models";
import StyleModel from "./StyleModel";

export default class ShapeModel {
    private _id: string;
    public get id(): string { return this._id; }
    public set id(value: string) { this._id = value; }

    private _styleModel: StyleModel;
    public get styleModel(): StyleModel { return this._styleModel; }
    public set styleModel(value: StyleModel) { this._styleModel = value; }

    constructor(
        { id, styleModel }:
        { id?: string, styleModel?: StyleModel } = { }
    ) {
        this._id = id || GenerateId();
        this._styleModel = styleModel || new StyleModel();
    }
}
