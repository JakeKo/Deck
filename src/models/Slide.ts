import Utilities from "../utilities/general";
import Graphic from "./Graphic";

export default class Slide {
    public id: string;
    public graphics: Array<Graphic>;

    constructor(
        { id, graphics }:
        { id?: string, graphics?: Array<Graphic> } = { }
    ) {
        this.id = id || Utilities.generateId();
        this.graphics = graphics || new Array<Graphic>();
    }
}
