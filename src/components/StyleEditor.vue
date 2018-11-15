/* tslint:disable */
<template>
<div id="style-editor" :style="styleEditorStyle">
    <div class="stretcher-horizontal left" @mousedown="stretch"></div>
    <div id="style-editor-content">
        <editor-line
            v-for="editorLineModel in editorLineModels"
            :editorBlocks="editorLineModel.editorBlocks"
            :key="editorLineModel.id"
        ></editor-line>
    </div>
    <div id="submit-button-container">
        <button id="submit-button" :style="submitButtonStyle" @click="submit">Apply</button>
    </div>
</div>
</template>

<script lang="ts">
/* tslint:enable */
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import EditorLineModel from "../models/EditorLineModel";
import EditorLine from "./EditorLine.vue";
import Utilities from "../Utilities";
import StyleModel from "../models/StyleModel";

@Component({
    components: {
        EditorLine
    }
})
export default class StyleEditor extends Vue {
    private editorLineModels: EditorLineModel[] = [];

    @Watch("object")
    private onObjectChanged(): void {
        this.importObject(this.object);
    }

    // Watch for changes to the style editor object
    get object(): StyleModel {
        return this.$store.getters.styleEditorObject;
    }

    get styleEditorStyle(): any {
        return {
            background: this.$store.getters.theme.primary,
            borderLeft: `1px solid ${this.$store.getters.theme.tertiary}`,
            minWidth: `${this.$store.getters.styleEditorWidth}px`
        };
    }

    get submitButtonStyle(): any {
        return {
            background: this.$store.getters.theme.tertiary
        };
    }

    private stretch(event: MouseEvent): void {
        const self = this;
        event.stopPropagation();
        event.preventDefault();
        document.addEventListener("mousemove", preview);
        document.addEventListener("mouseup", end);

        function preview(event: MouseEvent): void {
            self.$store.commit("styleEditorWidth", window.innerWidth - event.pageX);
        }

        function end(): void {
            document.removeEventListener("mousemove", preview);
            document.removeEventListener("mouseup", end);
        }
    }

    private submit(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        console.log(this.exportObject());
    }

    public importObject(json: any): void {
        this.editorLineModels = Utilities.objectToHtml({ style: json }, 0, 0);
    }

    public exportObject(): any {
        // TODO: More robust handling of array to and from json
        return Utilities.htmlToObject(this.editorLineModels).shape;
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
