/* tslint:disable */
<template>
<div id="toolbox" :style="{ borderRight: `1px solid ${$store.getters.theme.tertiary}`}">
    <tool @tool-click="shapeToolClickHandler"></tool>
    <tool @tool-click="slideToolClickHandler"></tool>
    <tool @tool-click="textboxToolClickHandler"></tool>
    <tool @tool-click="exportToolClickHandler"></tool>
    <tool></tool>
</div>
</template>

<script lang="ts">
/* tslint:enable */
import { Vue, Component } from "vue-property-decorator";
import Tool from "./Tool.vue";
import Shape from "./Shape.vue";
import SlideModel from "../models/SlideModel";

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

    public textboxToolClickHandler(): void {
        this.$store.commit("addTextboxToSlideWithId", this.$store.getters.activeSlide.id);
    }

    public exportToolClickHandler(): void {
        this.$store.dispatch("export");
    }
}
/* tslint:disable */
</script>

<style lang="scss" scoped>
#toolbox {
    width: 64px;
    flex-shrink: 0;
    flex-direction: column;
}
</style>
