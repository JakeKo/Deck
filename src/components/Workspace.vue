/* tslint:disable */
<template>
<div id="workspace">
    <editor></editor>
    <roadmap></roadmap>
</div>
</template>

<script lang="ts">
/* tslint:enable */
import Vue from "vue";
import Component from "vue-class-component";
import Editor from "./Editor.vue";
import Roadmap from "./Roadmap.vue";

@Component({
    components: {
        Editor,
        Roadmap
    }
})
export default class Workspace extends Vue {}
/* tslint:disable */
</script>

<style lang="scss" scoped>
#workspace {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
}
</style>
