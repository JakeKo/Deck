import * as SVG from "svg.js";
import Utilities from "../../utilities/general";
import IGraphic from "./IGraphic";
import Vector from "../Vector";
import SnapVector from "../SnapVector";

export default class Sketch implements IGraphic {
    public id: string;
    public type: string = "sketch";
    public boundingBoxId: string;
    public origin: Vector;
    public points: Array<Vector>;
    public fillColor: string;
    public strokeColor: string;
    public strokeWidth: number;
    public rotation: number;

    constructor(
        { id, origin, points, fillColor, strokeColor, strokeWidth, rotation }:
            { id?: string, origin?: Vector, points?: Array<Vector>, fillColor?: string, strokeColor?: string, strokeWidth?: number, rotation?: number } = {}
    ) {
        this.id = id || Utilities.generateId();
        this.boundingBoxId = Utilities.generateId();
        this.origin = origin || new Vector(0, 0);
        this.points = points || [];
        this.fillColor = fillColor || "#EEEEEE";
        this.strokeColor = strokeColor || "#000000";
        this.strokeWidth = strokeWidth || 1;
        this.rotation = rotation || 0;
    }

    public render(canvas: SVG.Doc): SVG.PolyLine {
        return canvas
            .polyline(this.points.map((point: Vector) => point.toArray()))
            .translate(this.origin.x, this.origin.y)
            .fill(this.fillColor)
            .stroke({ color: this.strokeColor, width: this.strokeWidth })
            .rotate(this.rotation)
            .id(`graphic_${this.id}`);
    }

    public updateRendering(svg: SVG.PolyLine): void {
        svg.plot(this.points.map((point: Vector) => point.toArray()))
            .rotate(0)
            .translate(this.origin.x, this.origin.y)
            .fill(this.fillColor)
            .stroke({ color: this.strokeColor, width: this.strokeWidth })
            .rotate(this.rotation);
    }

    public getSnapVectors(origin: Vector): Array<SnapVector> {
        const snapVectors: Array<SnapVector> = [];
        const svg: any = {};
        const boundingBox: SVG.RBox = svg.rbox();
        const width: number = boundingBox.width;
        const height: number = boundingBox.height;

        // Center, upper center, left center, lower center, right center
        snapVectors.push(new SnapVector(this.id, Utilities.transform(new Vector(width / 2, height / 2), svg), Vector.right));
        snapVectors.push(new SnapVector(this.id, Utilities.transform(new Vector(width / 2, height / 2), svg), Vector.up));
        snapVectors.push(new SnapVector(this.id, Utilities.transform(new Vector(width / 2, 0), svg), Vector.right));
        snapVectors.push(new SnapVector(this.id, Utilities.transform(new Vector(width, height / 2), svg), Vector.up));
        snapVectors.push(new SnapVector(this.id, Utilities.transform(new Vector(width / 2, height), svg), Vector.right));
        snapVectors.push(new SnapVector(this.id, Utilities.transform(new Vector(0, height / 2), svg), Vector.up));

        return snapVectors;
    }

    public getSnappableVectors(origin: Vector): Array<Vector> {
        return [];
    }
}
