import * as SVG from "svg.js";
import Utilities from "../utilities/general";
import IGraphic from "./IGraphic";
import BoundingBox from "./BoundingBox";
import Point from "./Point";

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

    public update(
        { points, fillColor, strokeColor, strokeWidth, rotation }:
            { points?: Array<Point>, fillColor?: string, strokeColor?: string, strokeWidth?: number, rotation?: number } = {}
    ): void {
        if (points !== undefined) {
            this.points = points;
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
            .id(this.id);
    }

    public static model(svg: SVG.PolyLine): Sketch {
        return new Sketch({
            points: (svg.array().value as any as Array<Array<number>>).map<Point>((point: Array<number>): Point => new Point(point[0], point[1])),
            fillColor: svg.attr("fill"),
            strokeColor: svg.attr("stroke"),
            strokeWidth: svg.attr("stroke-width"),
            rotation: svg.attr("rotation")
        });
    }
}
