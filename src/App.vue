/* tslint:disable */
<template>
<div id="app">
    <toolbox></toolbox>
    <div id="workspace" :style="workspaceStyle">
        <editor></editor>
        <roadmap></roadmap>
    </div>
    <style-editor v-show="$store.getters.focusedGraphicId"></style-editor>
</div>
</template>

<script lang="ts">
/* tslint:enable */
import { Vue, Component } from "vue-property-decorator";
import Toolbox from "./components/Toolbox.vue";
import Editor from "./components/Editor.vue";
import Roadmap from "./components/Roadmap.vue";
import StyleEditor from "./components/StyleEditor.vue";
import GraphicModel from "./models/GraphicModel";
import SlideModel from "./models/SlideModel";
import Utilities from "./utilities/miscellaneous";
import Point from "./models/Point";

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

        document.addEventListener("keydown", (event: KeyboardEvent) => {
            if (event.key === "Delete" || event.key === "Backspace") {
                this.$store.commit("removeGraphic", { slideId: this.$store.getters.activeSlide.id, graphicId: this.$store.getters.focusedGraphicId });
                this.$store.commit("focusGraphic", undefined);
                this.$store.commit("styleEditorObject", undefined);
            }
        });

        // Overrides the default behavior of copy to copy the graphic model of the focused graphic
        document.addEventListener("copy", (event: Event): void => {
            // Cast event as clipboard event and prevent from copying any user selection
            const clipboardEvent: ClipboardEvent = event as ClipboardEvent;
            clipboardEvent.preventDefault();

            const focusedGraphicId: string | undefined = this.$store.getters.focusedGraphicId;
            if (focusedGraphicId === undefined) {
                return;
            }

            // Fetch the graphic model associated with the current focused graphic
            const activeSlide: SlideModel = this.$store.getters.activeSlide;
            const graphicModel: GraphicModel = activeSlide.graphics.find((graphicModel: GraphicModel) => graphicModel.id === focusedGraphicId)!;

            // Set the clipboard data to the graphic model
            clipboardEvent.clipboardData.setData("text/json", JSON.stringify(graphicModel));
        });

        // Override the default behavior of the paste to paste the copied graphic model
        document.addEventListener("paste", (event: Event) => {
            // Cast event as clipboard event
            const clipboardEvent: ClipboardEvent = event as ClipboardEvent;
            clipboardEvent.preventDefault();

            const activeSlide: SlideModel = this.$store.getters.activeSlide;
            const clipboardData: any = JSON.parse(clipboardEvent.clipboardData.getData("text/json"));

            // Correct some loss of data and generate a new id for the new graphic model
            clipboardData.id = Utilities.generateId();
            if (clipboardData.styleModel.points !== undefined) {
                clipboardData.styleModel.points = clipboardData.styleModel.points.map((point: { x: number, y: number}) => new Point(point.x, point.y));
            }

            const graphicModel: GraphicModel = new GraphicModel(clipboardData);
            activeSlide.graphics.push(graphicModel);
            this.$store.commit("focusGraphic", graphicModel);
            this.$store.commit("styleEditorObject", graphicModel);
        });
    }

    get workspaceStyle(): any {
        const styleEditorHidden: boolean = this.$store.getters.focusedGraphicId === undefined;
        return {
            width: `calc(100vw - ${this.$store.getters.toolboxWidth + (styleEditorHidden ? 0 : this.$store.getters.styleEditorWidth)}px)`
        };
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

#workspace {
    display: flex;
    flex-direction: column;
}
</style>
