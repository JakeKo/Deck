import { GenerateId } from "../utilities/models";

export default class ShapeModel {
    private _id: String;
    public get id(): String { return this._id; }
    public set id(value: String) { this._id = value; }

    private _backgroundColor?: String;
    public get backgroundColor(): String | undefined { return this._backgroundColor; }
    public set backgroundColor(value: String | undefined) { this._backgroundColor = value; }

    private _height?: String;
    public get height(): String | undefined { return this._height; }
    public set height(value: String | undefined) { this._height = value; }

    private _width?: String;
    public get width(): String | undefined { return this._width; }
    public set width(value: String | undefined) { this._width = value; }

    constructor(id?: String, backgroundColor?: String, height?: String, width?: String) {
        this._id = id || GenerateId();
        this._backgroundColor = backgroundColor;
        this._height = height;
        this._width = width;
    }

    public ToJson() {
        return {
            id: this.id,
            backgroundColor: this.backgroundColor,
            height: this.height,
            width: this.width
        };
    }
}
