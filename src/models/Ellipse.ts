import * as SVG from "svg.js";
import Utilities from "../utilities/general";
import IGraphic from "./IGraphic";
import Rectangle from "./Rectangle";
import Point from "./Point";

export default class Ellipse implements IGraphic {
    public id: string;
    public center: Point;
    public width: number;
    public height: number;
    public fillColor: string;
    public strokeColor: string;
    public strokeWidth: number;
    public rotation: number;

    constructor(
        { id, center, width, height, fillColor, strokeColor, strokeWidth, rotation }:
        { id?: string, center?: Point, width?: number, height?: number, fillColor?: string, strokeColor?: string, strokeWidth?: number, rotation?: number } = {}
    ) {
        this.id = id || Utilities.generateId();
        this.center = center || new Point(0, 0);
        this.width = width || 50;
        this.height = height || 50;
        this.fillColor = fillColor || "#EEEEEE";
        this.strokeColor = strokeColor || "#000000";
        this.strokeWidth = strokeWidth || 1;
        this.rotation = rotation || 0;
    }

    public getBoundingBox(): Rectangle {
        return new Rectangle({
            // TODO: Handle different rotation behaviors between ellipse and rectangle
            origin: new Point(this.center.x - this.width * 0.5, this.center.y - this.height * 0.5),
            width: this.width,
            height: this.height,
            fillColor: "none",
            strokeColor: "magenta",
            strokeWidth: 1,
            rotation: this.rotation
        });
    }

    public render(canvas: SVG.Doc): SVG.Ellipse {
        return canvas
            .ellipse(this.width, this.height)
            .center(this.center.x, this.center.y)
            .fill(this.fillColor)
            .stroke({ color: this.strokeColor, width: this.strokeWidth })
            .rotate(this.rotation, this.center.x, this.center.y);
    }

    public static model(svg: SVG.Ellipse): Ellipse {
        return new Ellipse({
            center: new Point(svg.cx(), svg.cy()),
            width: svg.width(),
            height: svg.height(),
            fillColor: svg.attr("fill"),
            strokeColor: svg.attr("stroke"),
            strokeWidth: svg.attr("stroke-width"),
            rotation: svg.attr("rotation")
        });
    }
}
