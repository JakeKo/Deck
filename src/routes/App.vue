/* tslint:disable */
<template>
<div id="app">
    <toolbox></toolbox>
    <workspace></workspace>
</div>
</template>

<script lang="ts">
/* tslint:enable */
import { Vue, Component } from "vue-property-decorator";
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
#app {
    display: flex;
    height: 100vh;
}
</style>
