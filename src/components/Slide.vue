/* tslint:disable */
<template>
<div id="slide" :style="slideStyle">
    <!-- <svg>
        <shape
            v-for="(shape) in $store.getters.activeSlideShapes"
            :focused="shape.id === $store.getters.activeSlide.focusedShapeId"
            :styleModel="shape.styleModel"
            :points="shape.points"
            :key="shape.id"
            :id="shape.id"
            @element-focused="(id) => $emit('element-focused', id)">
        </shape>
        <textbox
            v-for="(textbox) in $store.getters.activeSlideTextboxes"
            :focused="textbox.id === $store.getters.activeSlide.focusedShapeId"
            :styleModel="textbox.styleModel"
            :x="textbox.x"
            :y="textbox.y"
            :text="textbox.text"
            :key="textbox.id"
            :id="textbox.id"
            @element-focused="(id) => $emit('element-focused', id)">
        </textbox>
    </svg> -->
</div>
</template>

<script lang="ts">
/* tslint:enable */
import { Vue, Component } from "vue-property-decorator";
import Shape from "./Shape.vue";
import Textbox from "./Textbox.vue";
import * as SVG from "svg.js";

@Component({
    components: {
        Shape,
        Textbox
    }
})
export default class Slide extends Vue {
    get slideStyle(): any {
        return {
            boxShadow: `0 0 4px 0 ${this.$store.getters.theme.tertiary}`,
            background: this.$store.getters.theme.primary
        };
    }

    public mounted(): void {
        const canvas = SVG(this.$el.id);
        const rect = canvas.rect(100, 100).attr({ fill: "#f06" });
    }
}
/* tslint:disable */
</script>

<style lang="scss" scoped>
#slide {
    height: 603px;
    width: 1072px;
}

svg {
    height: 100%;
    width: 100%;
}
</style>
