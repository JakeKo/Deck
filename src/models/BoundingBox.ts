import * as SVG from "svg.js";
import Point from "./Point";
import IGraphic from "./IGraphic";

export default class BoundingBox implements IGraphic {
    public id: string;
    public boundingBoxId: string;
    public origin: Point;
    public width: number;
    public height: number;
    public fillColor: string = "none";
    public strokeColor: string = "magenta";
    public strokeWidth: number = 1;
    public rotation: number;

    constructor(id: string, origin: Point, width: number, height: number, rotation: number) {
        this.id = id;
        this.boundingBoxId = id;
        this.origin = origin;
        this.width = width;
        this.height = height;
        this.rotation = rotation;
    }

    // Note: Filler method so BoundingBox can be an IGraphic
    get boundingBox(): BoundingBox {
        return this;
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
