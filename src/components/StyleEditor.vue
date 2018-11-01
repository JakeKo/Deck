/* tslint:disable */
<template>
<div id="style-editor" :style="styleEditorStyle">
    <div class="stretcher-horizontal left" :style="stretcherStyle" @mousedown="startStretch"></div>
    <div id="style-editor-content">
        <editor-line
            v-for="editorLineModel in editorLineModels"
            :editorBlocks="editorLineModel.editorBlocks"
            :key="editorLineModel.id">
        </editor-line>
    </div>
    <div id="submit-button-container">
        <button id="submit-button" :style="submitButtonStyle" @click="submit">Apply</button>
    </div>
</div>
</template>

<script lang="ts">
/* tslint:enable */
import { Vue, Component } from "vue-property-decorator";
import TextboxModel from "../models/TextboxModel";
import ShapeModel from "../models/ShapeModel";
import EditorLineModel from "../models/EditorLineModel";
import EditorLine from "./EditorLine.vue";
import Utilities from "../utilities/Utilities";

@Component({
    components: {
        EditorLine
    }
})
export default class StyleEditor extends Vue {
    private width: number = this.$store.getters.styleEditorWidth;
    private stretcherWidth: number = 6;
    private editorLineModels: EditorLineModel[] = [];

    get styleEditorStyle(): any {
        return {
            background: this.$store.getters.theme.primary,
            borderLeft: `1px solid ${this.$store.getters.theme.tertiary}`,
            minWidth: `${this.width}px`
        };
    }

    get submitButtonStyle(): any {
        return {
            background: this.$store.getters.theme.tertiary
        };
    }

    get stretcherStyle(): any {
        return {
            width: `${this.stretcherWidth}px`
        };
    }

    private startStretch(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget!.addEventListener("mousemove", this.previewStretch);
        event.currentTarget!.addEventListener("mouseup", this.endStretch);

        this.stretcherWidth = window.innerWidth * 2;
    }

    private previewStretch(event: any): void {
        event.preventDefault();
        event.stopPropagation();
        this.width = window.innerWidth - event.pageX;
    }

    private endStretch(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget!.removeEventListener("mousemove", this.previewStretch);
        event.currentTarget!.removeEventListener("mouseup", this.endStretch);

        this.stretcherWidth = 6;
        this.$store.commit("setStyleEditorWidth", this.width);
    }

    private submit(event: Event): void {
        event.preventDefault();
        event.stopPropagation();

        // TODO: More robust handling of array to and from json
        const json = Utilities.htmlToObject(this.editorLineModels).shape;
        this.$store.getters.focusedElement.reset(json);
    }

    public resetStyleEditor(json: ShapeModel | TextboxModel): void {
        this.editorLineModels = Utilities.objectToHtml({ shape: json }, 0, 0);
    }
}
/* tslint:disable */
</script>

<style lang="scss" scoped>
@import "../styles/components";

#style-editor {
    position: relative;
    display: flex;
    flex-direction: column;
}

#style-editor-content {
    flex-grow: 1;
    border: none;
    outline: none;
    font-family: monospace;
}

#submit-button-container {
    height: 96px;
    display: flex;
    justify-content: center;
    align-items: center;
}

#submit-button {
    height: 48px;
    width: 80%;
    cursor: pointer;
    border: none;
    outline: none;
}
</style>
