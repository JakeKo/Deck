export default class StyleModel {
    [key:string]: string | number;
    public fill: string;
    public stroke: string;
    public strokeWidth: string;
    public x: number;
    public y: number;
    public width: number;
    public height: number;
    public message: string;
    public rotation: number;

    constructor(
        {
            fill,
            stroke,
            strokeWidth,
            x,
            y,
            width,
            height,
            message,
            rotation
        }:
        {
            fill?: string,
            stroke?: string,
            strokeWidth?: string,
            x?: number,
            y?: number,
            width?: number,
            height?: number,
            message?: string,
            rotation?: number
        } = {}
    ) {
        this.fill = fill || "green";
        this.stroke = stroke || "black";
        this.strokeWidth = strokeWidth || "1";
        this.x = x || 0;
        this.y = y || 0;
        this.width = width || 100;
        this.height = height || 100;
        this.message = message || "";
        this.rotation = rotation || 0;
    }
}
