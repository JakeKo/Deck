<template>
<div id="toolbox">
    <tool @click="$store.commit('tool', 'cursor')" :toolName="'cursor'" :icon="'fas fa-mouse-pointer'" :isActive="$store.getters.toolName === 'cursor'"></tool>
    <tool @click="$store.commit('tool', 'pencil')" :toolName="'pencil'" :icon="'fas fa-pen'" :isActive="$store.getters.toolName === 'pencil'"></tool>
    <tool @click="$store.commit('tool', 'pen')" :toolName="'pen'" :icon="'fas fa-pen-nib'" :isActive="$store.getters.toolName === 'pen'"></tool>
    <tool @click="$store.commit('tool', 'rectangle')" :toolName="'rectangle'" :icon="'fas fa-square'" :isActive="$store.getters.toolName === 'rectangle'"></tool>
    <tool @click="$store.commit('tool', 'ellipse')" :toolName="'ellipse'" :icon="'fas fa-circle'" :isActive="$store.getters.toolName === 'ellipse'"></tool>
    <tool @click="$store.commit('tool', 'textbox')" :toolName="'text'" :icon="'fas fa-font'" :isActive="$store.getters.toolName === 'textbox'"></tool>
    <tool @click="uploadImage" :toolName="'image'" :icon="'fas fa-image'" :isActive="false"></tool>
    <tool @click="uploadVideo" :toolName="'video'" :icon="'fas fa-video'" :isActive="false"></tool>
    <tool @click="$store.dispatch('export')" :toolName="'export'" :icon="'fas fa-cloud-download-alt'" :isActive="false"></tool>
    <tool @click="uploadPresentation" :toolName="'load'" :icon="'fas fa-file-upload'" :isActive="false"></tool>
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
import Video from "../models/graphics/Video";
import Slide from "../models/Slide";
import IGraphic from "../models/graphics/IGraphic";
import Utilities from "../utilities/general";

@Component({
    components: {
        Tool
    }
})
export default class Toolbox extends Vue {
    private input!: HTMLInputElement;
    private fileReader!: FileReader;

    private mounted(): void {
        this.fileReader = new FileReader();

        this.input = document.createElement("input");
        this.input.type = "file";
        this.input.style.display = "none";
        this.input.addEventListener("change", (event: Event): void => {
            // Fetch the uploaded file and abort if no file was selected
            const file: File = (event.target as HTMLInputElement).files![0];
            if (file === undefined) {
                return;
            }

            // Asynchronously read the uploaded file as a binary string
            this.fileReader.readAsBinaryString(file);
            (event.target as HTMLInputElement).value = "";
        });
    }

    private uploadImage(): void {
        this.fileReader.onloadend = (event: FileReaderProgressEvent): void => {
            if (this.$store.getters.activeSlide === undefined) {
                return;
            }

            // Create a promise that waits for the image width and height to be determined
            const imageUrl: string = `data:image;base64,${btoa(this.fileReader.result)}`;
            const promise = new Promise((resolve, reject): void => {
                const image: HTMLImageElement = document.createElement<"img">("img");
                image.src = imageUrl;

                image.addEventListener("load", (event: Event): void => {
                    image.remove();
                    const target: any = event.target;
                    resolve({ width: target.width, height: target.height });
                });
            });

            promise.then((value: any): void => {
                const graphic: Image = new Image({ source: imageUrl, width: value.width, height: value.height });
                this.$store.commit("addGraphic", { slideId: this.$store.getters.activeSlide.id, graphic: graphic });
            });
        };

        this.input.click();
    }

    private uploadVideo(): void {
        const videoUrl: string | null = window.prompt("Enter a link to the video you would like add:");
        if (this.$store.getters.activeSlide === undefined || videoUrl === null || videoUrl === "") {
            return;
        }

        const promise = new Promise((resolve, reject): void => {
            const video: HTMLVideoElement = document.createElement("video");
            video.src = videoUrl;

            video.addEventListener("loadedmetadata", (event: Event): void => {
                video.remove();
                const target: any = event.target;
                resolve({ width: target.videoWidth, height: target.videoHeight });
            });
        });

        promise.then((value: any): void => {
            const graphic: Video = new Video({ source: videoUrl, width: value.width, height: value.height });
            this.$store.commit("addGraphic", { slideId: this.$store.getters.activeSlide.id, graphic: graphic });
        });
    }

    private uploadPresentation(): void {
        this.fileReader.onloadend = (event: FileReaderProgressEvent): void => {
            const json: any = JSON.parse(this.fileReader.result);
            const slides: Array<Slide> = json.map((slide: any): Slide => new Slide({
                id: slide.id,
                graphics: slide.graphics.map((graphic: any): IGraphic => Utilities.parseGraphic(graphic))
            }));

            this.$store.dispatch("resetPresentation", slides);
        };

        this.input.click();
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
