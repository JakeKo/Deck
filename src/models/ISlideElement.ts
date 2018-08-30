import StyleModel from "./StyleModel";
import TextboxStyleModel from "./TextboxStyleModel";

export default interface ISlideElement {
    id?: string;
    styleModel?: StyleModel | TextboxStyleModel;
}
