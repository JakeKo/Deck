/* tslint:disable */
<template>
<div id="app">
    <toolbox></toolbox>
    <workspace @element-focused="setFocusedElement"></workspace>
    <style-editor ref="styleEditor" v-show="$store.getters.focusedElement"></style-editor>
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
        this.$store.commit("addSlideAfterSlideWithId");
        this.$store.commit("setActiveSlide", this.$store.getters.firstSlide.id);
    }

    private setFocusedElement(id: string): void {
        this.$store.commit("setFocusedElement", id);
        const styleEditor: any = this.$refs.styleEditor;
        styleEditor.resetStyleEditor(this.$store.getters.focusedElement);
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
