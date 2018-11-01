import Utilities from "../Utilities";
import ISlideElement from "./ISlideElement";

export default class SlideModel {
    public id: string;
    public elements: ISlideElement[];
    public focusedElementId: string;

    constructor(
        { id, elements, focusedElementId }:
        { id?: string, elements?: ISlideElement[], focusedElementId?: string } = { }
    ) {
        this.id = id || Utilities.generateId();
        this.elements = elements || [];
        this.focusedElementId = focusedElementId || "";
    }
}
