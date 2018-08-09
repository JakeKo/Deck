/* tslint:disable */
<template>
<div id="style-editor">{{ content }}</div>
</template>

<script lang="ts">
/* tslint:enable */
import { Vue, Component } from "vue-property-decorator";

@Component
export default class StyleEditor extends Vue {
    get content(): string {
        const focusedShape = this.$store.getters.focusedShape;
        return focusedShape ? focusedShape.styleModel : "";
    }
}
/* tslint:disable */
</script>

<style lang="scss" scoped>
#style-editor {
    width: 448px;
    background: white;
    border-left: 1px solid rgba(0, 0, 0, 0.15);
}
</style>
