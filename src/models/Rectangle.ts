import Utilities from "../utilities/general";
import Point from "./Point";

export default class Rectangle {
    public id: string;
    public origin: Point;
    public width: number;
    public height: number;
    public fillColor: string;
    public strokeColor: string;
    public strokeWidth: number;
    public rotation: number;

    constructor(
        { id, origin, width, height, fillColor, strokeColor, strokeWidth, rotation }:
        { id?: string, origin?: Point, width?: number, height?: number, fillColor?: string, strokeColor?: string, strokeWidth?: number, rotation?: number } = {}
    ) {
        this.id = id || Utilities.generateId();
        this.origin = origin || new Point(0, 0);
        this.width = width || 50;
        this.height = height || 50;
        this.fillColor = fillColor || "#EEEEEE";
        this.strokeColor = strokeColor || "#000000";
        this.strokeWidth = strokeWidth || 1;
        this.rotation = rotation || 0;
    }

    get boundingBox(): Rectangle {
        return new Rectangle({
            origin: this.origin,
            width: this.width,
            height: this.height,
            fillColor: "none",
            strokeColor: "magenta",
            strokeWidth: 1,
            rotation: this.rotation
        });
    }
}