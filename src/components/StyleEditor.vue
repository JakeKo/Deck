/* tslint:disable */
<template>
<div id="style-editor" :style="styleEditorStyle">
    <div class="stretcher-horizontal left" @mousedown="stretch"></div>
    <textarea id="style-editor-content" v-model="content" @keydown="onKeyDown"></textarea>
    <div id="submit-button-container">
        <button id="submit-button" :style="submitButtonStyle" @click="submit">Apply</button>
    </div>
</div>
</template>

<script lang="ts">
/* tslint:enable */
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import Utilities from "../utilities/miscellaneous";
import StyleModel from "../models/StyleModel";

@Component
export default class StyleEditor extends Vue {
    private content: string = "";

    @Watch("object")
    private onObjectChanged(): void {
        this.content = Utilities.toPrettyString(this.object, 1);
    }

    // Watch for changes to the style editor object
    get object(): StyleModel {
        return this.$store.getters.styleEditorObject;
    }

    get styleEditorStyle(): any {
        return {
            background: this.$store.getters.theme.primary,
            borderLeft: `1px solid ${this.$store.getters.theme.tertiary}`,
            width: `${this.$store.getters.styleEditorWidth}px`
        };
    }

    get submitButtonStyle(): any {
        return {
            background: this.$store.getters.theme.tertiary
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

    private onKeyDown(event: KeyboardEvent): void {
        // Prevent keydowns in the style editor from affecting the slide or other elements
        // For example - delete and backspace propagation must be stopped lest they remove a graphic
        event.stopPropagation();
        this.content = this.content; // TODO: Remove noop
    }

    private submit(event: Event): void {
        event.preventDefault();
        event.stopPropagation();

        this.$store.commit("graphicStyle", { graphicId: this.$store.getters.styleEditorObjectId, style: JSON.parse(this.content) });
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
}
</style>
