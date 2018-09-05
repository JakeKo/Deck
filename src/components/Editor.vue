/* tslint:disable */
<template>
<div id="editor">
    <div id="canvas" :style="style">
        <slide @element-focused="(id) => $emit('element-focused', id)"></slide>
    </div>
</div>
</template>

<script lang="ts">
/* tslint:enable */
import { Vue, Component } from "vue-property-decorator";
import Slide from "./Slide.vue";

@Component({
    components: {
        Slide
    }
})
export default class Editor extends Vue {
    public mounted() {
        this.$el.scrollTop = this.$store.state.canvas.height / 2 - this.$el.clientHeight / 2;
        this.$el.scrollLeft = this.$store.state.canvas.width / 2 - this.$el.clientWidth / 2;
    }

    get style(): any {
        return {
            "width": `${this.$store.state.canvas.width}px`,
            "height": `${this.$store.state.canvas.height}px`,
            "background": `${this.$store.getters.theme.secondary}`
        };
    }
}
/* tslint:disable */
</script>

<style lang="scss" scoped>
#editor {
    overflow: scroll;
}

#canvas {
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
