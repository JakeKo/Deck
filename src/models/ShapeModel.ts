import Utilities from "../Utilities";
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
        this.id = id || Utilities.generateId();
        this.styleModel = styleModel || new StyleModel();
        this.points = points || new Array<Point>();
    }

    public reset(model: any): void {
        // Note: Do not reset the id
        this.styleModel = new StyleModel(model.styleModel);
        this.points = Object.keys(model.points).map((key) => new Point(Number(model.points[key].x), Number(model.points[key].y)));
    }
}
