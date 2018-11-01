import { GenerateId } from "../utilities/models";

export default class EditorBlockModel {
    public id: string;
    public content: string;
    public style: any;

    constructor(
        { id, content, style }:
        { id?: string, content?: string, style?: any } = { }
    ) {
        this.id = id || GenerateId();
        this.content = content || "";
        this.style = style || {};
    }
}
