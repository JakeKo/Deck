import * as SVG from "svg.js";
import Utilities from "../utilities/general";
import IGraphic from "./IGraphic";
import BoundingBox from "./BoundingBox";
import Point from "./Point";

export default class Ellipse implements IGraphic {
    public id: string;
    public type: string = "ellipse";
    public boundingBoxId: string;
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
        this.boundingBoxId = Utilities.generateId();
        this.origin = origin || new Point(0, 0);
        this.width = width || 50;
        this.height = height || 50;
        this.fillColor = fillColor || "#EEEEEE";
        this.strokeColor = strokeColor || "#000000";
        this.strokeWidth = strokeWidth || 1;
        this.rotation = rotation || 0;
    }

    get boundingBox(): BoundingBox {
        return new BoundingBox(this.boundingBoxId, new Point(this.origin.x - this.width * 0.5, this.origin.y - this.height * 0.5), this.width, this.height, this.rotation);
    }

    public update(
        { origin, width, height, fillColor, strokeColor, strokeWidth, rotation }:
            { origin?: Point, width?: number, height?: number, fillColor?: string, strokeColor?: string, strokeWidth?: number, rotation?: number } = {}
    ): void {
        if (origin !== undefined) {
            this.origin = origin;
        }

        if (width !== undefined) {
            this.width = width;
        }

        if (height !== undefined) {
            this.height = height;
        }

        if (fillColor !== undefined) {
            this.fillColor = fillColor;
        }

        if (strokeColor !== undefined) {
            this.strokeColor = strokeColor;
        }

        if (strokeWidth !== undefined) {
            this.strokeWidth = strokeWidth;
        }

        if (rotation !== undefined) {
            this.rotation = rotation;
        }
    }

    public render(canvas: SVG.Doc): SVG.Ellipse {
        return canvas
            .ellipse(this.width, this.height)
            .center(this.origin.x, this.origin.y)
            .fill(this.fillColor)
            .stroke({ color: this.strokeColor, width: this.strokeWidth })
            .rotate(this.rotation, this.origin.x, this.origin.y)
            .id(`graphic_${this.id}`);
    }

    public static model(svg: SVG.Ellipse): Ellipse {
        return new Ellipse({
            origin: new Point(svg.cx(), svg.cy()),
            width: svg.width(),
            height: svg.height(),
            fillColor: svg.attr("fill"),
            strokeColor: svg.attr("stroke"),
            strokeWidth: svg.attr("stroke-width"),
            rotation: svg.attr("rotation")
        });
    }
}
