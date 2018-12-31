import Utilities from "../utilities/general";
import Style from "./Style";

export default class Graphic {
    public id: string;
    public type: string;
    public style: Style;
    public focusStyle: Style;

    constructor(
        { id, type, style, focusStyle }:
        { id?: string, type?: string, style?: Style, focusStyle?: Style} = { }
    ) {
        this.id = id || Utilities.generateId();
        this.type = type || "";
        this.style = style || new Style();
        this.focusStyle = focusStyle || new Style();
    }
}
