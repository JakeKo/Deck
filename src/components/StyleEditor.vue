/* tslint:disable */
<template>
<div id="style-editor" :style="styleEditorStyle">
    <div class="stretcher-horizontal left" @mousedown="startStretch"></div>
    <textarea id="editor" v-model="content" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"></textarea>
    <div id="submit-button-container">
        <button id="submit-button" :style="submitButtonStyle" @click="submit">Apply</button>
    </div>
</div>
</template>

<script lang="ts">
/* tslint:enable */
import { Vue, Component, Prop } from "vue-property-decorator";

@Component
export default class StyleEditor extends Vue {
    private content: string = "";
    private width: number = this.$store.getters.styleEditorWidth;

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

    private startStretch(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        document.addEventListener("mousemove", this.previewStretch);
        document.addEventListener("mouseup", this.endStretch);
    }

    private previewStretch(event: any): void {
        this.width = window.innerWidth - event.pageX;
    }

    private endStretch(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        this.$store.commit("setStyleEditorWidth", this.width);
        document.removeEventListener("mousemove", this.previewStretch);
        document.removeEventListener("mouseup", this.endStretch);
    }

    private submit(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        const focusedElement = this.$store.getters.focusedElement;
        focusedElement.fromJson(this.content);
    }

    public resetStyleEditor(content: string): void {
        this.content = content;
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

#editor {
    flex-grow: 1;
    border: none;
    outline: none;
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
