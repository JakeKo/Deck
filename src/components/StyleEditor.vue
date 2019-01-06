<template>
<div id="style-editor" :style="styleEditorStyle">
    <div class="stretcher-horizontal left" @mousedown="stretch"></div>
    <textarea id="style-editor-content" v-model="content" @keydown="$event.stopPropagation()"></textarea>
    <div id="submit-button-container">
        <button id="submit-button" @click="submit">Apply</button>
    </div>
</div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import Utilities from "../utilities/general";
import IGraphic from "../models/IGraphic";

@Component
export default class StyleEditor extends Vue {
    private content: string = "";

    @Watch("object") private onObjectChanged(): void {
        this.content = Utilities.toPrettyString(this.object, 1);
    }

    // Watch for changes to the style editor object
    get object(): any {
        return this.$store.getters.styleEditorObject;
    }

    get styleEditorStyle(): any {
        return {
            width: `${this.$store.getters.styleEditorWidth}px`
        };
    }

    private stretch(event: MouseEvent): void {
        event.stopPropagation();
        event.preventDefault();
        document.addEventListener("mousemove", preview);
        document.addEventListener("mouseup", end);

        const self = this;
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

        // TODO: Style editor content validation
        const json: any = JSON.parse(this.content);
        const graphic: IGraphic = Utilities.parseGraphic(json);

        this.$store.commit("updateGraphic", graphic);
    }
}
</script>

<style lang="scss" scoped>
@import "../styles/application";

#style-editor {
    position: relative;
    display: flex;
    flex-direction: column;
    background: $color-primary;
    border-left: 1px solid $color-tertiary;
}

#style-editor-content {
    height: calc(100% - 96px);
    font-family: monospace;
    border: none;
    outline: none;
    height: 100%;
    width: 100%;
    resize: none;
    box-sizing: border-box;
    padding: 8px;
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
    background: $color-tertiary;
}
</style>
