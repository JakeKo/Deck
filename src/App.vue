<template>
<div id="app">
    <toolbox></toolbox>
    <div id="workspace">
        <editor></editor>
        <roadmap></roadmap>
    </div>
    <style-editor v-show="$store.getters.focusedGraphic !== undefined"></style-editor>
</div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import Toolbox from "./components/Toolbox.vue";
import Editor from "./components/Editor.vue";
import Roadmap from "./components/Roadmap.vue";
import StyleEditor from "./components/StyleEditor.vue";
import Utilities from "./utilities/general";
import IGraphic from "./models/IGraphic";

@Component({
    components: {
        Toolbox,
        Editor,
        Roadmap,
        StyleEditor
    }
})
export default class App extends Vue {
    private created(): void {
        this.$store.commit("addSlide");
        this.$store.commit("activeSlide", this.$store.getters.firstSlide.id);

        document.addEventListener("keydown", (event: KeyboardEvent): void => {
            if (event.key === "Delete" || event.key === "Backspace") {
                if (this.$store.getters.focusedGraphic === undefined) {
                    return;
                }

                // Remove the bounding box graphic
                const boundingBoxId: number = this.$store.getters.focusedGraphic.getBoundingBox().id;
                this.$store.commit("removeGraphic", { slideId: this.$store.getters.activeSlide.id, graphicId: boundingBoxId });

                // Remove the focused graphic
                this.$store.commit("removeGraphic", { slideId: this.$store.getters.activeSlide.id, graphicId: this.$store.getters.focusedGraphic.id });
                this.$store.commit("focusGraphic", undefined);
                this.$store.commit("styleEditorObject", undefined);
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

            const graphic: IGraphic = Utilities.parseGraphic(data);
            graphic.id = Utilities.generateId();
            this.$store.commit("addGraphic", { slideId: this.$store.getters.activeSlide.id, graphic: graphic });
            this.$store.commit("focusGraphic", graphic);
            this.$store.commit("styleEditorObject", graphic);
        });
    }
}
</script>

<style lang="scss" scoped>
#app {
    height: 100vh;
    width: 100vw;
    display: flex;
}

#workspace {
    display: flex;
    flex-direction: column;
    height: 100vh;
    min-width: 0; // Override min-width default for flex items
}
</style>
