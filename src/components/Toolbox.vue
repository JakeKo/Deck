/* tslint:disable */
<template>
<div id="toolbox">
    <tool @tool-click="shapeToolClickHandler"></tool>
    <tool @tool-click="slideToolClickHandler"></tool>
    <tool></tool>
    <tool></tool>
    <tool></tool>
</div>
</template>

<script lang="ts">
/* tslint:enable */
import { Vue, Component } from "vue-property-decorator";
import Tool from "./Tool.vue";
import Shape from "./Shape.vue";

@Component({
    components: {
        Tool
    }
})
export default class Toolbox extends Vue {
    public shapeToolClickHandler(): void {
        this.$store.commit("addShapeToSlideWithId", this.$store.getters.activeSlide.id);
    }

    public slideToolClickHandler(): void {
        this.$store.commit("addSlideAfterSlideWithId", this.$store.getters.activeSlide.id);
    }
}
/* tslint:disable */
</script>

<style lang="scss" scoped>
#toolbox {
    width: 64px;
    border-right: 1px solid rgba(0, 0, 0, 0.15);
    flex-shrink: 0;
    flex-direction: column;
}
</style>
