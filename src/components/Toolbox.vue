/* tslint:disable */
<template>
<div id="toolbox">
    <tool></tool>
    <tool></tool>
    <tool></tool>
    <tool></tool>
    <tool></tool>
</div>
</template>

<script lang="ts">
/* tslint:enable */
import { Vue, Component } from "vue-property-decorator";
import Tool from "./Tool.vue";

@Component({
    components: {
        Tool
    }
})
export default class Toolbox extends Vue {}
/* tslint:disable */
</script>

<style lang="scss" scoped>
#toolbox {
    width: 64px;
    border-right: 1px solid rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
}
</style>
