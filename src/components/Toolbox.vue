<template>
<div id="toolbox">
    <tool @click="$store.commit('tool', 'cursor')" :toolName="'cursor'" :icon="'fas fa-mouse-pointer'" :isActive="$store.getters.tool.name === 'cursor'"></tool>
    <tool @click="$store.commit('tool', 'pencil')" :toolName="'pencil'" :icon="'fas fa-pen'" :isActive="$store.getters.tool.name === 'pencil'"></tool>
    <tool @click="$store.commit('tool', 'pen')" :toolName="'pen'" :icon="'fas fa-pen-nib'" :isActive="$store.getters.tool.name === 'pen'"></tool>
    <tool @click="$store.commit('tool', 'rectangle')" :toolName="'rectangle'" :icon="'fas fa-square'" :isActive="$store.getters.tool.name === 'rectangle'"></tool>
    <tool @click="$store.commit('tool', 'ellipse')" :toolName="'ellipse'" :icon="'fas fa-circle'" :isActive="$store.getters.tool.name === 'ellipse'"></tool>
    <tool @click="$store.commit('tool', 'textbox')" :toolName="'text'" :icon="'fas fa-font'" :isActive="$store.getters.tool.name === 'textbox'"></tool>
    <tool @click="input.click()" :toolName="'image'" :icon="'fas fa-image'" :isActive="false"></tool>
    <tool @click="addVideo" :toolName="'video'" :icon="'fas fa-video'" :isActive="false"></tool>
    <tool @click="$store.dispatch('export')" :toolName="'export'" :icon="'fas fa-cloud-download-alt'" :isActive="false"></tool>
    <tool @click="$store.dispatch('save')" :toolName="'save'" :icon="'fas fa-save'" :isActive="false"></tool>
    <a href="https://github.com/JakeKo/Deck/issues/new/choose" target="blank" style="text-decoration: none">
        <tool :toolName="'feedback'" :icon="'fas fa-info'" :isActive="false"></tool>
    </a>
</div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import Tool from "./Tool.vue";
import Image from "../models/graphics/Image";
import Point from "../models/Point";
import Video from "../models/graphics/Video";

@Component({
    components: {
        Tool
    }
})
export default class Toolbox extends Vue {
    private input!: HTMLInputElement;

    private mounted(): void {
        this.input = document.createElement("input");
        this.input.type = "file";
        this.input.style.display = "none";

        this.input.addEventListener("change", (event: Event): void => {
            // Fetch the uploaded file and abort if no file was selected
            const imageFile: File = (event.target as HTMLInputElement).files![0];
            if (imageFile === undefined) {
                return;
            }

            // Create the file reader and set the event handler after reading is complete
            const fileReader: FileReader = new FileReader();
            fileReader.onloadend = (event: FileReaderProgressEvent): void => {
                if (this.$store.getters.activeSlide === undefined) {
                    return;
                }

                const imageUrl: string = event.target!.result;
                this.$store.commit("addGraphic", { slideId: this.$store.getters.activeSlide.id, graphic: new Image({ source: imageUrl }) });
            };

            // Asynchronously read the uploaded presentation as text
            fileReader.readAsDataURL(imageFile);
            (event.target as HTMLInputElement).value = "";
        });
    }

    private addVideo(): void {
        console.log("Hello");
        this.$store.commit("addGraphic", { slideId: this.$store.getters.activeSlide.id, graphic: new Video({ source: "http://techslides.com/demos/sample-videos/small.mp4" }) });
    }
}
</script>

<style lang="scss" scoped>
@import "../styles/colors";

#toolbox {
    border-right: 1px solid $color-tertiary;
    flex-direction: column;
    flex-shrink: 0;
    width: 64px;
}
</style>
