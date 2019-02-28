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
        this.width = width || 0;
        this.height = height || 0;
        this.rotation = rotation || 0;
    }

    get boundingBox(): BoundingBox {
        return new BoundingBox(this.boundingBoxId, this.origin, this.width, this.height, this.rotation);
    }

    public render(canvas: SVG.Doc): SVG.Image {
        return canvas
            .image(this.source)
            .move(this.origin.x, this.origin.y)
            .size(this.width, this.height)
            .rotate(this.rotation)
            .id(`graphic_${this.id}`);
    }

    public updateRendering(svg: SVG.Image): void {
        svg.move(this.origin.x, this.origin.y)
            .size(this.width, this.height)
            .rotate(this.rotation);
    }
}
