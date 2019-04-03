import * as SVG from "svg.js";
import Utilities from "../../utilities/general";
import IGraphic from "./IGraphic";
import Vector from "../Vector";
import SnapVector from "../SnapVector";

export default class Text implements IGraphic {
    public id: string;
    public type: string = "text";
    public boundingBoxId: string;
    public origin: Vector;
    public content: string;
    public fontSize: number;
    public fontWeight: string;
    public fontFamily: string;
    public fillColor: string;
    public rotation: number;

    constructor(
        { id, origin, content, fontSize, fontWeight, fontFamily, fillColor, rotation }:
            { id?: string, origin?: Vector, content?: string, fontSize?: number, fontWeight?: string, fontFamily?: string, fillColor?: string, rotation?: number } = {}
    ) {
        this.id = id || Utilities.generateId();
        this.boundingBoxId = Utilities.generateId();
        this.origin = origin || new Vector(0, 0);
        this.content = content || "lorem ipsum dolor sit amet";
        this.fontSize = fontSize || 12;
        this.fontWeight = fontWeight || "400";
        this.fontFamily = fontFamily || "Arial";
        this.fillColor = fillColor || "#000000";
        this.rotation = rotation || 0;
    }

    public render(canvas: SVG.Doc): SVG.Text {
        return canvas
            .text(this.content)
            .translate(this.origin.x, this.origin.y)
            .font({ size: this.fontSize, weight: this.fontWeight, family: this.fontFamily })
            .fill(this.fillColor)
            .rotate(this.rotation)
            .id(`graphic_${this.id}`);
    }

    public updateRendering(svg: SVG.Text): void {
        svg.text(this.content)
            .rotate(0)
            .translate(this.origin.x, this.origin.y)
            .font({ size: this.fontSize, weight: this.fontWeight, family: this.fontFamily })
            .fill(this.fillColor)
            .rotate(this.rotation);
    }

    public getSnapVectors(origin: Vector): Array<SnapVector> {
        const snapVectors: Array<SnapVector> = [];
        const svg: any = {};
        const width: number = svg.width();
        const height: number = svg.height();

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
