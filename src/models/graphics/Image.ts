import * as SVG from "svg.js";
import Utilities from "../../utilities/general";
import IGraphic from "./IGraphic";
import BoundingBox from "./BoundingBox";
import Point from "../Point";

export default class Image implements IGraphic {
    public id: string;
    public type: string = "image";
    public boundingBoxId: string;
    public origin: Point;
    public source: string;
    public width: number;
    public height: number;
    public rotation: number;

    constructor(
        { id, origin, source, width, height, rotation }:
            { id?: string, origin?: Point, source?: string, width?: number, height?: number, rotation?: number } = {}
    ) {
        this.id = id || Utilities.generateId();
        this.boundingBoxId = Utilities.generateId();
        this.origin = origin || new Point(0, 0);
        this.source = source || "";
        this.width = width || 50;
        this.height = height || 50;
        this.rotation = rotation || 0;
    }

    get boundingBox(): BoundingBox {
        return new BoundingBox(this.boundingBoxId, this.origin, this.width, this.height, this.rotation);
    }

    public render(canvas: SVG.Doc): SVG.Image {
        return canvas
            .image(this.source, this.width, this.height)
            .move(this.origin.x, this.origin.y)
            .rotate(this.rotation, this.origin.x + this.width / 2, this.origin.y + this.height / 2)
            .id(`graphic_${this.id}`);
    }
}
