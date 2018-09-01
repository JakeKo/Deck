import { GenerateId } from "../utilities/models";
import ISlideElement from "./ISlideElement";

export default class SlideModel {
    public id: string;
    public elements: ISlideElement[];
    public focusedElementId: string;

    constructor(
        { id, elements, focusedElementId }:
        { id?: string, elements?: ISlideElement[], focusedElementId?: string } = { }
    ) {
        this.id = id || GenerateId();
        this.elements = elements || [];
        this.focusedElementId = focusedElementId || "";
    }
}
