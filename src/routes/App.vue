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
export default class App extends Vue {
    public created() {
        this.$store.commit("addSlideAfterSlideWithId");
        this.$store.commit("setActiveSlide", this.$store.getters.firstSlide.id);
    }
}
/* tslint:disable */
</script>

<style lang="scss" scoped>
#app {
    display: flex;
    height: 100vh;
    overflow: hidden;
}
</style>
