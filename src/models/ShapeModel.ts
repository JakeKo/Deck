import { GenerateId } from "../utilities/models";
import StyleModel from "./StyleModel";
import Point from "./Point";

export default class ShapeModel {
    private _id: string;
    public get id(): string { return this._id; }
    public set id(value: string) { this._id = value; }

    private _styleModel: StyleModel;
    public get styleModel(): StyleModel { return this._styleModel; }
    public set styleModel(value: StyleModel) { this._styleModel = value; }

    private _points: Point[];
    public get points(): Point[] { return this._points; }
    public set points(value: Point[]) { this._points = value; }

    constructor(
        { id, styleModel, points }:
        { id?: string, styleModel?: StyleModel, points?: Point[] } = { }
    ) {
        this._id = id || GenerateId();
        this._styleModel = styleModel || new StyleModel();
        this._points = points || new Array<Point>();
    }
}
