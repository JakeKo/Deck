/* tslint:disable */
<template>
<div id="slide">
    <svg>
        <shape
            v-for="(shape) in $store.getters.activeSlide.shapes"
            :focused="shape.id === $store.getters.activeSlide.focusedElementId"
            :styleModel="shape.styleModel"
            :points="shape.points"
            :key="shape.id"
            :id="shape.id"
            @shape-focused="(id) => $emit('shape-focused', id)">
        </shape>
        <textbox
            v-for="(textbox) in $store.getters.activeSlide.textboxes"
            :focused="textbox.id === $store.getters.activeSlide.focusedElementId"
            :styleModel="textbox.styleModel"
            :x="textbox.x"
            :y="textbox.y"
            :text="textbox.text"
            :key="textbox.id"
            :id="textbox.id"
            @text-focused="(id) => $emit('shape-focused', id)">
        </textbox>
    </svg>
</div>
</template>

<script lang="ts">
/* tslint:enable */
import { Vue, Component } from "vue-property-decorator";
import Shape from "./Shape.vue";
import Textbox from "./Textbox.vue";

@Component({
    components: {
        Shape,
        Textbox
    }
})
export default class Slide extends Vue {}
/* tslint:disable */
</script>

<style lang="scss" scoped>
#slide {
    height: 603px;
    width: 1072px;
    box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.15);
    background: #FFF;
}

svg {
    height: 100%;
    width: 100%;
}
</style>
