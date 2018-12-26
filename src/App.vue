<template>
<div id="app">
    <!-- <menu-bar></menu-bar> -->
    <div id="interface">
        <toolbox></toolbox>
        <div id="workspace" :style="workspaceStyle">
            <editor></editor>
            <roadmap></roadmap>
        </div>
        <style-editor v-show="$store.getters.focusedGraphicId"></style-editor>
    </div>
</div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import Toolbox from "./components/Toolbox.vue";
// import MenuBar from "./components/MenuBar.vue";
import Editor from "./components/Editor.vue";
import Roadmap from "./components/Roadmap.vue";
import StyleEditor from "./components/StyleEditor.vue";
import Utilities from "./utilities/miscellaneous";

@Component({
    components: {
        Toolbox,
        // MenuBar,
        Editor,
        Roadmap,
        StyleEditor
    }
})
export default class App extends Vue {
    private created(): void {
        this.$store.commit("addSlide");
        this.$store.commit("activeSlide", this.$store.getters.firstSlide.id);

        document.addEventListener("keydown", (event: KeyboardEvent) => {
            if (event.key === "Delete" || event.key === "Backspace") {
                this.$store.commit("removeGraphic", { slideId: this.$store.getters.activeSlide.id, graphicId: this.$store.getters.focusedGraphicId });
                this.$store.commit("focusGraphic", undefined);
                this.$store.commit("styleEditorObject", undefined);
            }
        });

        document.addEventListener("copy", Utilities.copyHandler(this));
        document.addEventListener("paste", Utilities.pasteHandler(this));
    }

    get workspaceStyle(): any {
        const styleEditorHidden: boolean = this.$store.getters.focusedGraphicId === undefined;
        return {
            width: `calc(100vw - ${this.$store.getters.toolboxWidth + (styleEditorHidden ? 0 : this.$store.getters.styleEditorWidth)}px)`
        };
    }
}
</script>

<style lang="scss" scoped>
#app {
    height: 100vh;
}

#interface {
    display: flex;
}

#workspace {
    display: flex;
    flex-direction: column;
}
</style>
