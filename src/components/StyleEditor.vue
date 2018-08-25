/* tslint:disable */
<template>
<div id="style-editor" :style="{ 'min-width': `${width}px` }">
    <div id="zone" @mousedown="bindResize"></div>
    <textarea id="editor" v-model="content"></textarea>
    <div id="submit-button-container">
        <button id="submit-button" @click="submit">Apply</button>
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

    private bindResize(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        document.addEventListener("mousemove", this.mouseMoveHandler);
        document.addEventListener("mouseup", this.unbindResize);
    }

    private unbindResize(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        this.$store.commit("setStyleEditorWidth", this.width);
        document.removeEventListener("mousemove", this.mouseMoveHandler);
        document.removeEventListener("mouseup", this.unbindResize);
    }

    private mouseMoveHandler(event: any): void {
        // Event is any type because pageX is not defined on Event
        this.width = window.innerWidth - event.pageX;
    }

    private submit(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        const focusedShape = this.$store.getters.focusedShape;
        focusedShape.fromJson(this.content);
    }

    public resetStyleEditor(content: string): void {
        this.content = content;
    }
}
/* tslint:disable */
</script>

<style lang="scss" scoped>
#style-editor {
    background: white;
    border-left: 1px solid rgba(0, 0, 0, 0.15);
    position: relative;
}

#zone {
    position: absolute;
    height: 100%;
    width: 6px;
    transform: translateX(-50%);
    cursor: ew-resize;
}

#editor {
    width: 100%;
    height: calc(100% - 96px);
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
    background: rgba(0, 0, 0, 0.15);
    cursor: pointer;
    border: none;
    outline: none;
}
</style>
