import Utilities from "../utilities/general";
import IGraphic from "./IGraphic";
import Rectangle from "./Rectangle";
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
    }

    getBoundingBox(): Rectangle {
        const lines: Array<string> = this.content.split("\n");

        return new Rectangle({
            origin: this.origin,
            width: Math.max(...lines.map<number>((line: string): number => line.length)) * 8,
            height: lines.length * 20,
            fillColor: "none",
            strokeColor: "magenta",
            strokeWidth: 1,
            rotation: this.rotation
        });
    }
}