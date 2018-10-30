import { GenerateId } from "../utilities/models";
import StyleModel from "./StyleModel";
import Point from "./Point";
import ISlideElement from "./ISlideElement";

export default class ShapeModel implements ISlideElement {
    public id: string;
    public styleModel: StyleModel;
    public points: Point[];

    constructor(
        { id, styleModel, points }:
        { id?: string, styleModel?: StyleModel, points?: Point[] } = { }
    ) {
        this.id = id || GenerateId();
        this.styleModel = styleModel || new StyleModel();
        this.points = points || new Array<Point>();
    }

    public fromJson(jsonString: string): void {
        const json: any = JSON.parse(jsonString);

        this.points = [];
        json.points.forEach((point: { x: number, y: number }) => {
            this.points.push(new Point(point.x, point.y));
        });

        this.styleModel.fill = json.fill || "white";
        this.styleModel.stroke = json.stroke || "grey";
        this.styleModel.strokeWidth = json.strokeWidth || "1";
    }
}
