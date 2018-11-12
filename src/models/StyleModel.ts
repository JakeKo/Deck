export default class StyleModel {
    [key:string]: string;
    public fill: string;
    public stroke: string;
    public strokeWidth: string;

    constructor(
        { fill, stroke, strokeWidth }:
        { fill?: string, stroke?: string, strokeWidth?: string } = {}
    ) {
        this.fill = fill || "green";
        this.stroke = stroke || "black";
        this.strokeWidth = strokeWidth || "1";
    }
}
