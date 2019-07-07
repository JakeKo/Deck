<template>
<div id="app">
    <menu-bar></menu-bar>
    <div id="interface">
        <toolbox :toolName="$store.getters.toolName"></toolbox>
        <div id="workspace">
            <editor></editor>
            <roadmap></roadmap>
        </div>
        <graphic-editor></graphic-editor>
    </div>
</div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import MenuBar from "./components/MenuBar.vue";
import Toolbox from "./components/Toolbox.vue";
import Editor from "./components/Editor.vue";
import Roadmap from "./components/Roadmap.vue";
import GraphicEditor from "./components/GraphicEditor.vue";
import Utilities from "./utilities";
import { IGraphic } from "./types";

@Component({
    components: {
        MenuBar,
        Toolbox,
        Editor,
        Roadmap,
        GraphicEditor
    }
})
export default class App extends Vue {
    private created(): void {
        document.addEventListener("keydown", (event: KeyboardEvent): void => {
            if (["Delete", "Backspace"].indexOf(event.key) !== -1) {
                if (this.$store.getters.focusedGraphic === undefined) {
                    return;
                }

                // Remove the focused graphic
                const graphicId: string = this.$store.getters.focusedGraphic.id;
                this.$store.commit("focusGraphic", { slideId: this.$store.getters.activeSlide.id, graphicId: undefined });
                this.$store.commit("removeGraphic", { slideId: this.$store.getters.activeSlide.id, graphicId: graphicId });
                this.$store.commit("removeSnapVectors", { slideId: this.$store.getters.activeSlide.id, graphicId: graphicId });
                this.$store.commit("graphicEditorGraphicId", undefined);
            }
        });

        // Overrides the default behavior of copy to copy the graphic model of the focused graphic
        document.addEventListener("copy", (event: Event): void => {
            // Cast event as clipboard event and prevent from copying any user selection
            const clipboardEvent: ClipboardEvent = event as ClipboardEvent;
            clipboardEvent.preventDefault();

            const focusedGraphic: IGraphic | undefined = this.$store.getters.focusedGraphic;
            if (focusedGraphic === undefined) {
                return;
            }

            // Set the clipboard data to the graphic model associated with the current focused graphic
            const graphic: IGraphic = this.$store.getters.activeSlide.graphics.find((graphic: IGraphic) => graphic.id === focusedGraphic.id)!;
            clipboardEvent.clipboardData.setData("text/json", JSON.stringify(graphic));
        });

        document.addEventListener("paste", (event: Event): void => {
            // Cast event as clipboard event
            const clipboardEvent: ClipboardEvent = event as ClipboardEvent;
            clipboardEvent.preventDefault();

            const data: any = JSON.parse(clipboardEvent.clipboardData.getData("text/json"));
            if (data === undefined) {
                return;
            }

            const graphic: IGraphic = Utilities.parseGraphic({ ...data, id: Utilities.generateId() });
            this.$store.commit("addGraphic", { slideId: this.$store.getters.activeSlide.id, graphic: graphic });
            this.$store.commit("focusGraphic", { slideId: this.$store.getters.activeSlide.id, graphicId: graphic.id });
            this.$store.commit("graphicEditorGraphicId", graphic.id);
        });
    }
}
</script>

<style lang="scss" scoped>
#app {
    height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: column;
}

#interface {
    flex-grow: 1;
    flex-basis: 0;
    display: flex;
}

#workspace {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-width: 0; // Override min-width default for flex items
}
</style>
