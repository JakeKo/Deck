import Utilities from "../utilities";
import GraphicModel from "./GraphicModel";

export default class SlideModel {
    public id: string;
    public graphics: Array<GraphicModel>;

    constructor(
        { id, graphics }:
        { id?: string, graphics?: Array<GraphicModel> } = { }
    ) {
        this.id = id || Utilities.generateId();
        this.graphics = graphics || new Array<GraphicModel>();
    }
}
