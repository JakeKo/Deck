import Utilities from "../Utilities";
import StyleModel from "./StyleModel";

export default class GrahpicModel {
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

    public reset(model: any): void {
        // Note: Do not reset the id
        this.type = model.type;
        this.styleModel = new StyleModel(model.styleModel);
    }
}
