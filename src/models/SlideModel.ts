import { GenerateId } from "../utilities/models";
import ShapeModel from "./ShapeModel";

export default class SlideModel {
    private _id: string;
    public get id(): string { return this._id; }
    public set id(value: string) { this._id = value; }

    private _active: boolean;
    public get active(): boolean { return this._active; }
    public set active(value: boolean) { this._active = value; }

    private _previous?: string;
    public get previous(): string | undefined { return this._previous; }
    public set previous(value: string | undefined) { this._previous = value; }

    private _next?: string;
    public get next(): string | undefined { return this._next; }
    public set next(value: string | undefined) { this._next = value; }

    private _shapes: ShapeModel[];
    public get shapes(): ShapeModel[] { return this._shapes; }
    public set shapes(value: ShapeModel[]) { this._shapes = value; }

    constructor(
        { id, active, previous, next, shapes }:
        { id?: string, active?: boolean, previous?: string, next?: string, shapes?: ShapeModel[] } = { }
    ) {
        this._id = id || GenerateId();
        this._active = active || false;
        this._previous = previous;
        this._next = next;
        this._shapes = shapes = [];
    }
}
