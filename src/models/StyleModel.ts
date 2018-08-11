export default class StyleModel {
    private _backgroundColor: string;
    public get backgroundColor(): string { return this._backgroundColor; }
    public set backgroundColor(value: string) { this._backgroundColor = value; }

    private _height: string;
    public get height(): string { return this._height; }
    public set height(value: string) { this._height = value; }

    private _width: string;
    public get width(): string { return this._width; }
    public set width(value: string) { this._width = value; }

    private _border: string;
    public get border(): string { return this._border; }
    public set border(value: string) { this._border = value; }

    constructor({
        backgroundColor,
        height,
        width,
        border
    }: {
        backgroundColor?: string,
        height?: string,
        width?: string,
        border?: string
    } = { }) {
        this._backgroundColor = backgroundColor || "white";
        this._height = height || "100px";
        this._width = width || "100px";
        this._border = border || "1px solid rgba(0, 0, 0, 0.15)";
    }

    public toCss(): any {
        return {
            "background-color": this.backgroundColor,
            "height": this.height,
            "width": this.width,
            "border": this.border
        };
    }
}
