/* tslint:disable */
<template>
<div id="workspace">
    <editor></editor>
    <roadmap></roadmap>
</div>
</template>

<script lang="ts">
/* tslint:enable */
import { Vue, Component } from "vue-property-decorator";
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
    max-width: calc(100% - 64px);
}
</style>
