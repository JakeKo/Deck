import Utilities from "../Utilities";
import GrahpicModel from "./GraphicModel";

export default class SlideModel {
    public id: string;
    public elements: GrahpicModel[];
    public focusedElementId: string;

    constructor(
        { id, elements, focusedElementId }:
        { id?: string, elements?: GrahpicModel[], focusedElementId?: string } = { }
    ) {
        this.id = id || Utilities.generateId();
        this.elements = elements || [];
        this.focusedElementId = focusedElementId || "";

        this.elements.push(new GrahpicModel({ type: "rectangle" }));
    }
}
