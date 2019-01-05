import * as SVG from "svg.js";
import Utilities from "../utilities/general";
import IGraphic from "./IGraphic";
import Rectangle from "./Rectangle";
import Point from "./Point";

export default class Sketch implements IGraphic {
    public id: string;
    public points: Array<Point>;
    public fillColor: string;
    public strokeColor: string;
    public strokeWidth: number;
    public rotation: number;

    constructor(
        { id, points, fillColor, strokeColor, strokeWidth, rotation }:
        { id?: string, points?: Array<Point>, fillColor?: string, strokeColor?: string, strokeWidth?: number, rotation?: number } = {}
    ) {
        this.id = id || Utilities.generateId();
        this.points = points || [];
        this.fillColor = fillColor || "#EEEEEE";
        this.strokeColor = strokeColor || "#000000";
        this.strokeWidth = strokeWidth || 1;
        this.rotation = rotation || 0;
    }

    public getBoundingBox(): Rectangle {
        // Get the min and max of the points in the line to set the bounding box height and width
        const xCoordinates: Array<number> = this.points.map<number>((point: Point): number => point.x);
        const yCoordinates: Array<number> = this.points.map<number>((point: Point): number => point.y);
        const minimumPoint: Point = new Point(Math.min(...xCoordinates), Math.min(...yCoordinates));
        const maximumPoint: Point = new Point(Math.max(...xCoordinates), Math.max(...yCoordinates));

        return new Rectangle({
            // TODO: Handle different rotation behaviors between path and rectangle
            origin: minimumPoint,
            width: maximumPoint.x - minimumPoint.x,
            height: maximumPoint.y - minimumPoint.y,
            fillColor: "none",
            strokeColor: "magenta",
            strokeWidth: 1,
            rotation: this.rotation
        });
    }

    public render(canvas: SVG.Doc): SVG.PolyLine {
        // Get the min and max of the points in the line to infer rotation center
        const xCoordinates: Array<number> = this.points.map<number>((point: Point): number => point.x);
        const yCoordinates: Array<number> = this.points.map<number>((point: Point): number => point.y);
        const minimumPoint: Point = new Point(Math.min(...xCoordinates), Math.min(...yCoordinates));
        const maximumPoint: Point = new Point(Math.max(...xCoordinates), Math.max(...yCoordinates));
        const center: Point = minimumPoint.add(maximumPoint.add(minimumPoint.scale(-1)).scale(0.5));

        return canvas
            .polyline(this.points.map((point: Point) => point.toArray()))
            .fill(this.fillColor)
            .stroke({ color: this.strokeColor, width: this.strokeWidth })
            .rotate(this.rotation, center.x, center.y);
    }    
}