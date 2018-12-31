import Utilities from "../utilities/general";
import StyleModel from "./StyleModel";

export default class GraphicModel {
    public id: string;
    public type: string;
    public styleModel: StyleModel;

    constructor(
        { id, type, styleModel }:
        { id?: string, type?: string, styleModel?: StyleModel } = { }
    ) {
        this.id = id || Utilities.generateId();
        this.type = type || "";
        this.styleModel = styleModel || new StyleModel();
    }
}
