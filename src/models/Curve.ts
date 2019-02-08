import * as SVG from "svg.js";
import Utilities from "../utilities/general";
import IGraphic from "./IGraphic";
import BoundingBox from "./BoundingBox";
import Point from "./Point";

export default class Curve implements IGraphic {
    public id: string;
    public type: string = "curve";
    public boundingBoxId: string;
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
        this.boundingBoxId = Utilities.generateId();
        this.points = points || [];
        this.fillColor = fillColor || "#EEEEEE";
        this.strokeColor = strokeColor || "#000000";
        this.strokeWidth = strokeWidth || 1;
        this.rotation = rotation || 0;
    }

    get boundingBox(): BoundingBox {
        // Get the min and max of the points in the line to set the bounding box height and width
        const xCoordinates: Array<number> = this.points.map<number>((point: Point): number => point.x);
        const yCoordinates: Array<number> = this.points.map<number>((point: Point): number => point.y);
        const minimumPoint: Point = new Point(Math.min(...xCoordinates), Math.min(...yCoordinates));
        const maximumPoint: Point = new Point(Math.max(...xCoordinates), Math.max(...yCoordinates));

        return new BoundingBox(this.boundingBoxId, minimumPoint, maximumPoint.x - minimumPoint.x, maximumPoint.y - minimumPoint.y, this.rotation);
    }

    public render(canvas: SVG.Doc): SVG.Path {
        // Reformat points from an array of objects to the bezier curve string
        let points: string = `M ${this.points[0].x},${this.points[0].y}`;
        this.points.slice(1).forEach((point: Point, index: number) => {
            points += `${index % 3 === 0 ? " C" : ""} ${point.x},${point.y}`;
        });

        return canvas
            .path(points)
            .fill(this.fillColor)
            .stroke({ color: this.strokeColor, width: this.strokeWidth })
            .rotate(this.rotation)
            .id(this.id);
    }

    public static model(svg: SVG.Path): Curve {
        const path: Array<Array<number>> = svg.array().value as any as Array<Array<number>>;
        const points: Array<Point> = [new Point(path[0][1], path[0][2])];
        path.slice(1).forEach((curve: Array<number>): void => {
            points.push(new Point(curve[1], curve[2]));
            points.push(new Point(curve[3], curve[4]));
            points.push(new Point(curve[5], curve[6]));
        });

        return new Curve({
            points: points,
            fillColor: svg.attr("fill"),
            strokeColor: svg.attr("stroke"),
            strokeWidth: svg.attr("stroke-width"),
            rotation: svg.attr("rotation")
        });
    }
}
