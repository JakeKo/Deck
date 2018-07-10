import { GenerateId } from "../utilities/models";
import ShapeModel from "./ShapeModel";

export default class SlideModel {
    private _id: String;
    public get id(): String { return this._id; }
    public set id(value: String) { this._id = value; }

    private _active: Boolean;
    public get active(): Boolean { return this._active; }
    public set active(value: Boolean) { this._active = value; }

    private _previous?: String;
    public get previous(): String | undefined { return this._previous; }
    public set previous(value: String | undefined) { this._previous = value; }

    private _next?: String;
    public get next(): String | undefined { return this._next; }
    public set next(value: String | undefined) { this._next = value; }

    private _shapes: Array<ShapeModel>;
    public get shapes(): Array<ShapeModel> { return this._shapes; }
    public set shapes(value: Array<ShapeModel>) { this._shapes = value; }

    constructor(
        { id, active, previous, next, shapes }:
        { id?: String, active?: Boolean, previous?: String, next?: String, shapes?: Array<ShapeModel> } = { }
    ) {
        this._id = id || GenerateId();
        this._active = active || false;
        this._previous = previous;
        this._next = next;
        this._shapes = shapes = [];
    }
}
