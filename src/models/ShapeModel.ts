import { GenerateId } from "../utilities/models";

export default class ShapeModel {
    private _id: String;
    public get id(): String { return this._id; }
    public set id(value: String) { this._id = value; }

    private _style: Object;
    public get style(): Object { return this._style; }
    public set style(value: Object) { this._style = value; }

    constructor(style?: Object, id?: String) {
        this._style = style || { };
        this._id = id || GenerateId();
    }

    public ToJson() {
        return {
            id: this.id,
            style: this.style
        };
    }
}
