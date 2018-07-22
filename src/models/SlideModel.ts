import { GenerateId } from "../utilities/models";
import ShapeModel from "./ShapeModel";

export default class SlideModel {
    private _id: string;
    public get id(): string { return this._id; }
    public set id(value: string) { this._id = value; }

    private _shapes: ShapeModel[];
    public get shapes(): ShapeModel[] { return this._shapes; }
    public set shapes(value: ShapeModel[]) { this._shapes = value; }

    constructor(
        { id, shapes }:
        { id?: string, shapes?: ShapeModel[] } = { }
    ) {
        this._id = id || GenerateId();
        this._shapes = shapes = [];
    }
}
