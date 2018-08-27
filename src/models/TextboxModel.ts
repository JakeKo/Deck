import { GenerateId } from "../utilities/models";

export default class TextboxModel {
    private _id: string;
    public get id(): string { return this._id; }
    public set id(value: string) { this._id = value; }

    constructor(
        { id }:
        { id?: string } = { }
    ) {
        this._id = id || GenerateId();
    }
}
