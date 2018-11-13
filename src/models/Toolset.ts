import ToolModel from "./ToolModel";

export default class Toolset {
    [key:string]: ToolModel;
    public cursor: ToolModel;
    public rectangle: ToolModel;
    public textbox: ToolModel;

    constructor(cursor: ToolModel, rectangle: ToolModel, textbox: ToolModel) {
        this.cursor = cursor;
        this.rectangle = rectangle;
        this.textbox = textbox;
    }
}
