import Utilities from "../utilities/general";
import { IGraphic } from "../types";
import SnapVector from "./SnapVector";

export default class Slide {
    public id: string;
    public graphics: Array<IGraphic>;
    public snapVectors: Array<SnapVector>;
    public topic: string;

    constructor(
        { id, graphics, snapVectors, topic }:
        { id?: string, graphics?: Array<IGraphic>, snapVectors?: Array<SnapVector>, topic?: string } = { }
    ) {
        this.id = id || Utilities.generateId();
        this.graphics = graphics || new Array<IGraphic>();
        this.snapVectors = snapVectors || new Array<SnapVector>();
        this.topic = topic || "";
    }
}
