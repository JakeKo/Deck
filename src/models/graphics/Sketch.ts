import * as SVG from "svg.js";
import Utilities from "../../utilities/general";
import IGraphic from "./IGraphic";
import BoundingBox from "./BoundingBox";
import Point from "../Point";

export default class Sketch implements IGraphic {
    public id: string;
    public type: string = "sketch";
    public boundingBoxId: string;
    public origin: Point;
    public points: Array<Point>;
    public fillColor: string;
    public strokeColor: string;
    public strokeWidth: number;
    public rotation: number;

    constructor(
        { id, origin, points, fillColor, strokeColor, strokeWidth, rotation }:
            { id?: string, origin?: Point, points?: Array<Point>, fillColor?: string, strokeColor?: string, strokeWidth?: number, rotation?: number } = {}
    ) {
        this.id = id || Utilities.generateId();
        this.boundingBoxId = Utilities.generateId();
        this.origin = origin || new Point(0, 0);
        this.points = points || [];
        this.fillColor = fillColor || "#EEEEEE";
        this.strokeColor = strokeColor || "#000000";
        this.strokeWidth = strokeWidth || 1;
        this.rotation = rotation || 0;
    }

    get boundingBox(): BoundingBox {
        // Get the min and max of the points in the line to set the bounding box height and width
        const absolutePoints: Array<Point> = this.points.map<Point>((point: Point): Point => this.origin.add(point));
        absolutePoints.unshift(this.origin);

        const xCoordinates: Array<number> = absolutePoints.map<number>((point: Point): number => point.x);
        const yCoordinates: Array<number> = absolutePoints.map<number>((point: Point): number => point.y);
        const minimumPoint: Point = new Point(Math.min(...xCoordinates), Math.min(...yCoordinates));
        const maximumPoint: Point = new Point(Math.max(...xCoordinates), Math.max(...yCoordinates));

        return new BoundingBox(this.boundingBoxId, minimumPoint, maximumPoint.x - minimumPoint.x, maximumPoint.y - minimumPoint.y, this.rotation);
    }

    public render(canvas: SVG.Doc): SVG.PolyLine {
        // Get the min and max of the points in the line to infer rotation center
        const absolutePoints: Array<Point> = this.points.map<Point>((point: Point): Point => this.origin.add(point));
        absolutePoints.unshift(this.origin);

        const xCoordinates: Array<number> = absolutePoints.map<number>((point: Point): number => point.x);
        const yCoordinates: Array<number> = absolutePoints.map<number>((point: Point): number => point.y);
        const minimumPoint: Point = new Point(Math.min(...xCoordinates), Math.min(...yCoordinates));
        const maximumPoint: Point = new Point(Math.max(...xCoordinates), Math.max(...yCoordinates));
        const center: Point = minimumPoint.add(maximumPoint.add(minimumPoint.scale(-1)).scale(0.5));

        return canvas
            .polyline(absolutePoints.map((point: Point) => point.toArray()))
            .fill(this.fillColor)
            .stroke({ color: this.strokeColor, width: this.strokeWidth })
            .rotate(this.rotation, center.x, center.y)
            .id(`graphic_${this.id}`);
    }

    public updateRendering(svg: SVG.PolyLine): void {
        // Get the min and max of the points in the line to infer rotation center
        const absolutePoints: Array<Point> = this.points.map<Point>((point: Point): Point => this.origin.add(point));
        absolutePoints.unshift(this.origin);

        const xCoordinates: Array<number> = absolutePoints.map<number>((point: Point): number => point.x);
        const yCoordinates: Array<number> = absolutePoints.map<number>((point: Point): number => point.y);
        const minimumPoint: Point = new Point(Math.min(...xCoordinates), Math.min(...yCoordinates));
        const maximumPoint: Point = new Point(Math.max(...xCoordinates), Math.max(...yCoordinates));
        const center: Point = minimumPoint.add(maximumPoint.add(minimumPoint.scale(-1)).scale(0.5));

        svg.plot(absolutePoints.map((point: Point) => point.toArray()))
            .fill(this.fillColor)
            .stroke({ color: this.strokeColor, width: this.strokeWidth })
            .rotate(this.rotation, center.x, center.y);
    }
}
