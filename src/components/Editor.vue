/* tslint:disable */
<template>
<div id="editor">
    <div id="canvas">
        <slide></slide>
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
        this.$el.scrollTop = 1000 - this.$el.clientHeight / 2;
        this.$el.scrollLeft = 2000 - this.$el.clientWidth / 2;
    }
}
/* tslint:disable */
</script>

<style lang="scss" scoped>
#editor {
    height: calc(100vh - 96px);
    overflow: scroll;
}

#canvas {
    width: 4000px;
    height: 2000px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(0, 0, 0, 0.05);
}
</style>
