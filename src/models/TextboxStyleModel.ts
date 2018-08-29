export default class TextboxStyleModel {
    private _fill: string;
    public get fill(): string { return this._fill; }
    public set fill(value: string) { this._fill = value; }

    constructor(
        { fill }:
        { fill?: string } = {}
    ) {
        this._fill = fill || "grey";
    }
}
