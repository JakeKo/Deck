import Point from "./Point";

export default class StyleModel {
    public fill?: string;
    public stroke?: string;
    public strokeWidth?: number;
    public x?: number;
    public y?: number;
    public width?: number;
    public height?: number;
    public message?: string;
    public rotation?: number;
    public points?: Array<Point>;

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
            rotation,
            points
        }:
        {
            fill?: string,
            stroke?: string,
            strokeWidth?: number,
            x?: number,
            y?: number,
            width?: number,
            height?: number,
            message?: string,
            rotation?: number,
            points?: Array<Point>
        } = {}
    ) {
        this.fill = fill;
        this.stroke = stroke;
        this.strokeWidth = strokeWidth;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.message = message;
        this.rotation = rotation;
        this.points = points;
    }
}
