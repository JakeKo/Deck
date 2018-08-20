/* tslint:disable */
<template>
<div id="style-editor" :style="{ 'min-width': `${width}px` }">
    <div id="zone" @mousedown="bindResize"></div>
    {{ content }}
</div>
</template>

<script lang="ts">
/* tslint:enable */
import { Vue, Component, Prop } from "vue-property-decorator";

@Component
export default class StyleEditor extends Vue {
    private width: number = this.$store.getters.styleEditorWidth;

    get content(): string {
        const focusedShape = this.$store.getters.focusedShape;
        return focusedShape ? focusedShape.styleModel : "";
    }

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
</style>
