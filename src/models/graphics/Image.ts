import * as SVG from "svg.js";
import Utilities from "../../utilities/general";
import IGraphic from "./IGraphic";
import Vector from "../Vector";
import SnapVector from "../SnapVector";
import SlideWrapper from "../../utilities/SlideWrapper";
import Anchor from "../Anchor";

export default class Image implements IGraphic {
    public id: string;
    public type: string = "image";
    public boundingBoxId: string;
    public defaultInteractive: boolean;
    public origin: Vector;
    public source: string;
    public width: number;
    public height: number;
    public rotation: number;

    constructor(
        { id, defaultInteractive, origin, source, width, height, rotation }:
            { id?: string, defaultInteractive?: boolean, origin?: Vector, source?: string, width?: number, height?: number, rotation?: number } = {}
    ) {
        this.id = id || Utilities.generateId();
        this.boundingBoxId = Utilities.generateId();
        this.defaultInteractive = defaultInteractive === undefined ? true : defaultInteractive;
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

    public getSnapVectors(): Array<SnapVector> {
        const snapVectors: Array<SnapVector> = [];

        // Center, upper center, left center, lower center, right center
        snapVectors.push(new SnapVector(this.id, new Vector(this.origin.x + this.width / 2, this.origin.y + this.height / 2), Vector.right));
        snapVectors.push(new SnapVector(this.id, new Vector(this.origin.x + this.width / 2, this.origin.y + this.height / 2), Vector.up));
        snapVectors.push(new SnapVector(this.id, new Vector(this.origin.x + this.width / 2, this.origin.y), Vector.right));
        snapVectors.push(new SnapVector(this.id, new Vector(this.origin.x + this.width, this.origin.y + this.height / 2), Vector.up));
        snapVectors.push(new SnapVector(this.id, new Vector(this.origin.x + this.width / 2, this.origin.y + this.height), Vector.right));
        snapVectors.push(new SnapVector(this.id, new Vector(this.origin.x, this.origin.y + this.height / 2), Vector.up));

        return snapVectors;
    }

    public getSnappableVectors(): Array<Vector> {
        const snappableVectors: Array<Vector> = [];

        // Center, upper center, left center, lower center, right center
        snappableVectors.push(new Vector(this.origin.x, this.origin.y));
        snappableVectors.push(new Vector(this.origin.x + this.width, this.origin.y));
        snappableVectors.push(new Vector(this.origin.x + this.width, this.origin.y + this.height));
        snappableVectors.push(new Vector(this.origin.x, this.origin.y + this.height / 2));
        snappableVectors.push(new Vector(this.origin.x + this.width / 2, this.origin.y + this.height / 2));

        return snappableVectors;
    }

    public getAnchors(slideWrapper: SlideWrapper): Array<Anchor> {
        return [];
    }
}
