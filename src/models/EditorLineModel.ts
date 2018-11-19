import EditorBlockModel from "./EditorBlockModel";
import Utilities from "../utilities";

export default class EditorLineModel {
    public id: string;
    public editorBlocks: EditorBlockModel[];

    constructor(
        { id, editorBlocks }:
        { id?: string, editorBlocks?: EditorBlockModel[] } = { }
    ) {
        this.id = id || Utilities.generateId();
        this.editorBlocks = editorBlocks || [];
    }

    public addBlock(block: EditorBlockModel) {
        this.editorBlocks.push(block);
    }
}
