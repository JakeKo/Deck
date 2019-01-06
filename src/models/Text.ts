import * as SVG from "svg.js";
import Utilities from "../utilities/general";
import IGraphic from "./IGraphic";
import BoundingBox from "./BoundingBox";
import Point from "./Point";

export default class Text implements IGraphic {
    public id: string;
    public origin: Point;
    public content: string;
    public fontSize: number;
    public fontWeight: string;
    public fontFamily: string;
    public fillColor: string;
    public rotation: number;

    private boundingBox: BoundingBox;

    constructor(
        { id, origin, content, fontSize, fontWeight, fontFamily, fillColor, rotation }:
        { id?: string, origin?: Point, content?: string, fontSize?: number, fontWeight?: string, fontFamily?: string, fillColor?: string, rotation?: number } = {}
    ) {
        this.id = id || Utilities.generateId();
        this.origin = origin || new Point(0, 0);
        this.content = content || "lorem ipsum dolor sit amet";
        this.fontSize = fontSize || 12;
        this.fontWeight = fontWeight || "400";
        this.fontFamily = fontFamily || "Arial";
        this.fillColor = fillColor || "#000000";
        this.rotation = rotation || 0;

        this.boundingBox = new BoundingBox(new Point(0, 0), 0, 0, 0);
    }

    public getBoundingBox(): BoundingBox {
        const lines: Array<string> = this.content.split("\n");

        this.boundingBox.origin = this.origin;
        this.boundingBox.width = Math.max(...lines.map<number>((line: string): number => line.length)) * 8;
        this.boundingBox.height = lines.length * 20;
        this.boundingBox.rotation = this.rotation;

        return this.boundingBox;
    }

    public render(canvas: SVG.Doc): SVG.Text {
        return canvas
            .text(this.content)
            .move(this.origin.x, this.origin.y)
            .font({ size: this.fontSize, weight: this.fontWeight, family: this.fontFamily })
            .fill(this.fillColor)
            .rotate(this.rotation); // TODO: Infer 'center' of text
    }

    public static model(svg: SVG.Text): Text {
        return new Text({
            origin: new Point(svg.x(), svg.y()),
            content: svg.text(),
            fontSize: svg.attr("font-size"),
            fontWeight: svg.attr("font-weight"),
            fontFamily: svg.attr("font-family"),
            fillColor: svg.attr("fill"),
            rotation: svg.attr("rotation")
        });
    }
}
