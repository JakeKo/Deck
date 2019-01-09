import * as SVG from "svg.js";
import Utilities from "../utilities/general";
import IGraphic from "./IGraphic";
import BoundingBox from "./BoundingBox";
import Point from "./Point";

export default class Sketch implements IGraphic {
    public id: string;
    public points: Array<Point>;
    public fillColor: string;
    public strokeColor: string;
    public strokeWidth: number;
    public rotation: number;

    private boundingBox: BoundingBox;

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

        this.boundingBox = new BoundingBox(new Point(0, 0), 0, 0, 0);
    }

    public getBoundingBox(): BoundingBox {
        // Get the min and max of the points in the line to set the bounding box height and width
        const xCoordinates: Array<number> = this.points.map<number>((point: Point): number => point.x);
        const yCoordinates: Array<number> = this.points.map<number>((point: Point): number => point.y);
        const minimumPoint: Point = new Point(Math.min(...xCoordinates), Math.min(...yCoordinates));
        const maximumPoint: Point = new Point(Math.max(...xCoordinates), Math.max(...yCoordinates));

        this.boundingBox.origin = minimumPoint;
        this.boundingBox.width = maximumPoint.x - minimumPoint.x;
        this.boundingBox.height = maximumPoint.y - minimumPoint.y;
        this.boundingBox.rotation = this.rotation;

        return this.boundingBox;
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
