import { GenerateId } from "../utilities/models";

export default class ShapeModel {
    private _id: string;
    public get id(): string { return this._id; }
    public set id(value: string) { this._id = value; }

    private _style: Object;
    public get style(): Object { return this._style; }
    public set style(value: Object) { this._style = value; }

    constructor(
        { id, style }:
        { id?: string, style?: Object } = { }
    ) {
        this._id = id || GenerateId();
        this._style = style || { };
    }
}
