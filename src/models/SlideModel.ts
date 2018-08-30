import { GenerateId } from "../utilities/models";
import ShapeModel from "./ShapeModel";
import TextboxModel from "./TextboxModel";

export default class SlideModel {
    private _id: string;
    public get id(): string { return this._id; }
    public set id(value: string) { this._id = value; }

    private _shapes: ShapeModel[];
    public get shapes(): ShapeModel[] { return this._shapes; }
    public set shapes(value: ShapeModel[]) { this._shapes = value; }

    private _textboxes: TextboxModel[];
    public get textboxes(): TextboxModel[] { return this._textboxes; }
    public set textboxes(value: TextboxModel[]) { this._textboxes = value; }

    private _focusedElementId: string;
    public get focusedElementId(): string { return this._focusedElementId; }
    public set focusedElementId(value: string) { this._focusedElementId = value; }

    constructor(
        { id, shapes, textboxes, focusedElementId }:
        { id?: string, shapes?: ShapeModel[], textboxes?: TextboxModel[], focusedElementId?: string } = { }
    ) {
        this._id = id || GenerateId();
        this._shapes = shapes || [];
        this._textboxes = textboxes || [];
        this._focusedElementId = focusedElementId || "";
    }
}
