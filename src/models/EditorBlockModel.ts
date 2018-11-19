import Utilities from "../foo";

export default class EditorBlockModel {
    public id: string;
    public content: string;
    public style: any;

    constructor(
        { id, content, style }:
        { id?: string, content?: string, style?: any } = { }
    ) {
        this.id = id || Utilities.generateId();
        this.content = content || "";
        this.style = style || {};
    }
}
