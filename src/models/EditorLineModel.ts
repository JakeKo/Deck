import EditorBlockModel from "./EditorBlockModel";
import { GenerateId } from "../utilities/models";

export default class EditorLineModel {
    public id: string;
    public editorBlocks: EditorBlockModel[];

    constructor(
        { id, editorBlocks }:
        { id?: string, editorBlocks?: EditorBlockModel[] } = { }
    ) {
        this.id = id || GenerateId();
        this.editorBlocks = editorBlocks || [];
    }

    public addBlock(block: EditorBlockModel) {
        this.editorBlocks.push(block);
    }
}
