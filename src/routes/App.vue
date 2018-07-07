/* tslint:disable */
<template>
<div>
    <toolbox></toolbox>
    <workspace></workspace>
</div>
</template>

<script lang="ts">
/* tslint:enable */
import Vue from "vue";
import Component from "vue-class-component";
import Toolbox from "../components/Toolbox.vue";
import Workspace from "../components/Workspace.vue";

@Component({
    components: {
        Toolbox,
        Workspace
    }
})
export default class App extends Vue {}
/* tslint:disable */
</script>

<style lang="scss" scoped>

</style>