import Utilities from "../utilities";
import GraphicModel from "./GraphicModel";

export default class SlideModel {
    public id: string;
    public graphics: GraphicModel[];

    constructor(
        { id, graphics }:
        { id?: string, graphics?: GraphicModel[] } = { }
    ) {
        this.id = id || Utilities.generateId();
        this.graphics = graphics || [];
    }
}
