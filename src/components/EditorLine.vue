/* tslint:disable */
<template>
<div id="editor-line">
    <editor-block
        v-for="(editorBlock) in editorBlocks"
        :content="editorBlock.content"
        :blockStyle="editorBlock.style"
        :key="editorBlock.id">
    </editor-block>
</div>
</template>

<script lang="ts">
/* tslint:enable */
import { Vue, Component, Prop } from "vue-property-decorator";
import EditorBlockModel from "../models/EditorBlockModel";
import EditorBlock from "./EditorBlock.vue";

@Component({
    components: {
        EditorBlock
    }
})
export default class EditorLine extends Vue {
    @Prop({ type: Array, required: true })
    private editorBlocks?: EditorBlockModel[];

    public addBlock(block: EditorBlockModel): void {
        this.editorBlocks!.push(block);
    }
}
/* tslint:disable */
</script>

<style lang="scss" scoped>
#editor-line {
    display: flex;
}
</style>
