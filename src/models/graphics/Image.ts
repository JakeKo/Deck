import * as SVG from "svg.js";
import Utilities from "../../utilities/general";
import IGraphic from "./IGraphic";
import Vector from "../Vector";
import SnapVector from "../SnapVector";

export default class Image implements IGraphic {
    public id: string;
    public type: string = "image";
    public boundingBoxId: string;
    public origin: Vector;
    public source: string;
    public width: number;
    public height: number;
    public rotation: number;

    constructor(
        { id, origin, source, width, height, rotation }:
            { id?: string, origin?: Vector, source?: string, width?: number, height?: number, rotation?: number } = {}
    ) {
        this.id = id || Utilities.generateId();
        this.boundingBoxId = Utilities.generateId();
        this.origin = origin || new Vector(0, 0);
        this.source = source || "";
        this.width = width || 0;
        this.height = height || 0;
        this.rotation = rotation || 0;
    }

    public render(canvas: SVG.Doc): SVG.Image {
        return canvas
            .image(this.source)
            .translate(this.origin.x, this.origin.y)
            .size(this.width, this.height)
            .rotate(this.rotation)
            .id(`graphic_${this.id}`);
    }

    public updateRendering(svg: SVG.Image): void {
        svg.rotate(0)
            .translate(this.origin.x, this.origin.y)
            .size(this.width, this.height)
            .rotate(this.rotation);
    }

    public getSnapVectors(svg: SVG.Image): Array<SnapVector> {
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

    public getSnappableVectors(svg: SVG.Image): Array<Vector> {
        return [];
    }
}
