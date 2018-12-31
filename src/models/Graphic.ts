import Utilities from "../utilities/general";
import Style from "./Style";

export default class GraphicModel {
    public id: string;
    public type: string;
    public style: Style;

    constructor(
        { id, type, style }:
        { id?: string, type?: string, style?: Style } = { }
    ) {
        this.id = id || Utilities.generateId();
        this.type = type || "";
        this.style = style || new Style();
    }
}
