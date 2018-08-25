export default class StyleModel {
    private _fill: string;
    public get fill(): string { return this._fill; }
    public set fill(value: string) { this._fill = value; }

    private _stroke: string;
    public get stroke(): string { return this._stroke; }
    public set stroke(value: string) { this._stroke = value; }

    private _strokeWidth: string;
    public get strokeWidth(): string { return this._strokeWidth; }
    public set strokeWidth(value: string) { this._strokeWidth = value; }

    constructor({
        fill,
        stroke,
        strokeWidth
    }: {
            fill?: string,
            stroke?: string,
            strokeWidth?: string
        } = {}) {
        this._fill = fill || "white";
        this._stroke = stroke || "grey";
        this._strokeWidth = strokeWidth || "1";
    }

    public toJson(): string {
        return `{
    "fill": "${this.fill}",
    "stroke": "${this.stroke}",
    "strokeWidth": "${this.strokeWidth}"
}`;
    }

    public fromJson(jsonString: string): void {
        const json: any = JSON.parse(jsonString);
        this.fill = json.fill || "white";
        this.stroke = json.stroke || "grey";
        this.strokeWidth = json.strokeWidth || "1";
    }
}
