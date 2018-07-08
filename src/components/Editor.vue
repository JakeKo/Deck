/* tslint:disable */
<template>
<div id="editor">
    <slide></slide>
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
export default class Editor extends Vue {}
/* tslint:disable */
</script>

<style lang="scss" scoped>
#editor {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-grow: 1;
    background: rgba(0, 0, 0, 0.05);
}
</style>
