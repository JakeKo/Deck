/* tslint:disable */
<template>
<div id="app">
    <toolbox></toolbox>
    <workspace></workspace>
    <style-editor :object="$store.getters.styleEditorObject"></style-editor>
</div>
</template>

<script lang="ts">
/* tslint:enable */
import { Vue, Component } from "vue-property-decorator";
import Toolbox from "../components/Toolbox.vue";
import Workspace from "../components/Workspace.vue";
import StyleEditor from "../components/StyleEditor.vue";

@Component({
    components: {
        Toolbox,
        Workspace,
        StyleEditor
    }
})
export default class App extends Vue {
    public created(): void {
        this.$store.commit("addSlide");
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
