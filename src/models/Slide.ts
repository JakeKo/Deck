import Utilities from "../utilities/general";
import IGraphic from "./graphics/IGraphic";

export default class Slide {
    public id: string;
    public graphics: Array<IGraphic>;

    constructor(
        { id, graphics }:
        { id?: string, graphics?: Array<IGraphic> } = { }
    ) {
        this.id = id || Utilities.generateId();
        this.graphics = graphics || new Array<IGraphic>();
    }
}
