/* tslint:disable */
<template>
<div id="editor">
    <div id="canvas" :style="canvasStyle">
        <slide v-for="slide in $store.getters.slides" 
            :key="slide.id"
            :id="slide.id"
            :graphics="slide.graphics"
        ></slide>
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

    get canvasStyle(): any {
        return {
            width: `${this.$store.state.canvas.width}px`,
            height: `${this.$store.state.canvas.height}px`,
            background: this.$store.getters.theme.secondary
        };
    }
}
/* tslint:disable */
</script>

<style lang="scss" scoped>
#editor {
    overflow: scroll;
}

::-webkit-scrollbar {
    height: 10px;
    width: 10px;
    background: #EEEEEE;
}

::-webkit-scrollbar-thumb {
    background: #DDDDDD;
    border-radius: 5px;
}

#canvas {
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
