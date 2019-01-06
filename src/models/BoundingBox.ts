import * as SVG from "svg.js";
import Utilities from "../utilities/general";
import Point from "./Point";

export default class BoundingBox {
    public id: string = Utilities.generateId();
    public origin: Point;
    public width: number;
    public height: number;
    public fillColor: string = "transparent";
    public strokeColor: string = "magenta";
    public strokeWidth: number = 1;
    public rotation: number;

    constructor(origin: Point, width: number, height: number, rotation: number) {
        this.origin = origin;
        this.width = width;
        this.height = height;
        this.rotation = rotation;
    }

    public render(canvas: SVG.Doc): SVG.Rect {
        return canvas
            .rect(this.width, this.height)
            .move(this.origin.x, this.origin.y)
            .fill(this.fillColor)
            .stroke({ color: this.strokeColor, width: this.strokeWidth })
            .rotate(this.rotation, this.origin.x + this.width, this.origin.y + this.height);
    }
}