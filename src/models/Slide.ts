import Utilities from "../utilities/general";
import IGraphic from "./graphics/IGraphic";
import SnapVector from "./SnapVector";

export default class Slide {
    public id: string;
    public graphics: Array<IGraphic>;
    public snapVectors: Array<SnapVector>;

    constructor(
        { id, graphics, snapVectors }:
        { id?: string, graphics?: Array<IGraphic>, snapVectors?: Array<SnapVector> } = { }
    ) {
        this.id = id || Utilities.generateId();
        this.graphics = graphics || new Array<IGraphic>();
        this.snapVectors = snapVectors || new Array<SnapVector>();
    }
}
