import * as SVG from "svg.js";
import Utilities from "../../utilities/general";
import IGraphic from "./IGraphic";
import Vector from "../Vector";
import SnapVector from "../SnapVector";

export default class Ellipse implements IGraphic {
    public id: string;
    public type: string = "ellipse";
    public boundingBoxId: string;
    public origin: Vector;
    public width: number;
    public height: number;
    public fillColor: string;
    public strokeColor: string;
    public strokeWidth: number;
    public rotation: number;

    constructor(
        { id, origin, width, height, fillColor, strokeColor, strokeWidth, rotation }:
            { id?: string, origin?: Vector, width?: number, height?: number, fillColor?: string, strokeColor?: string, strokeWidth?: number, rotation?: number } = {}
    ) {
        this.id = id || Utilities.generateId();
        this.boundingBoxId = Utilities.generateId();
        this.origin = origin || new Vector(0, 0);
        this.width = width || 50;
        this.height = height || 50;
        this.fillColor = fillColor || "#EEEEEE";
        this.strokeColor = strokeColor || "#000000";
        this.strokeWidth = strokeWidth || 1;
        this.rotation = rotation || 0;
    }

    public render(canvas: SVG.Doc): SVG.Ellipse {
        return canvas
            .ellipse(this.width, this.height)
            .translate(this.origin.x, this.origin.y)
            .fill(this.fillColor)
            .stroke({ color: this.strokeColor, width: this.strokeWidth })
            .rotate(this.rotation)
            .id(`graphic_${this.id}`);
    }

    public updateRendering(svg: SVG.Ellipse): void {
        svg.size(this.width, this.height)
            .rotate(0)
            .translate(this.origin.x, this.origin.y)
            .fill(this.fillColor)
            .stroke({ color: this.strokeColor, width: this.strokeWidth })
            .rotate(this.rotation);
    }

    public getSnapVectors(svg: SVG.Ellipse): Array<SnapVector> {
        const snapVectors: Array<SnapVector> = [];

        // Center, upper center, left center, lower center, right center
        snapVectors.push(new SnapVector(this.id, Utilities.transform(new Vector(this.width / 2, this.height / 2), svg), Vector.right));
        snapVectors.push(new SnapVector(this.id, Utilities.transform(new Vector(this.width / 2, this.height / 2), svg), Vector.up));
        snapVectors.push(new SnapVector(this.id, Utilities.transform(new Vector(this.width / 2, 0), svg), Vector.right));
        snapVectors.push(new SnapVector(this.id, Utilities.transform(new Vector(this.width, this.height / 2), svg), Vector.up));
        snapVectors.push(new SnapVector(this.id, Utilities.transform(new Vector(this.width / 2, this.height), svg), Vector.right));
        snapVectors.push(new SnapVector(this.id, Utilities.transform(new Vector(0, this.height / 2), svg), Vector.up));

        return snapVectors;
    }

    public getSnappableVectors(svg: SVG.Ellipse): Array<Vector> {
        return [];
    }
}
