import Utilities from "../Utilities";
import GrahpicModel from "./GraphicModel";

export default class SlideModel {
    public id: string;
    public graphics: GrahpicModel[];

    constructor(
        { id, graphics }:
        { id?: string, graphics?: GrahpicModel[] } = { }
    ) {
        this.id = id || Utilities.generateId();
        this.graphics = graphics || [];
    }
}
