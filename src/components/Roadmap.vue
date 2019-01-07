<template>
<div id="roadmap">
    <div class="stretcher-vertical top" @mousedown="stretch"></div>
    <div id="slide-previews">
        <slide-preview v-for="slide in $store.getters.slides"
            :id="slide.id"
            :isActive="slide.id === $store.getters.activeSlide.id"
            :graphics="$store.getters.slides.find((s) => s.id === slide.id).graphics"
            :key="slide.id"
        ></slide-preview>
        <div id="new-slide-button" class="slide-preview" @click="addSlide">
            <i class="fas fa-plus"></i>
        </div>
    </div>
</div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import SlidePreview from "./SlidePreview.vue";

@Component({
    components: {
        SlidePreview
    }
})
export default class Roadmap extends Vue {
    private stretch(event: MouseEvent): void {
        event.stopPropagation();
        event.preventDefault();
        document.addEventListener("mousemove", preview);
        document.addEventListener("mouseup", end);

        function preview(event: MouseEvent): void {
            // Update the height of the roadmap
            const height: number = Math.max(Math.min(window.innerHeight - event.pageY, 256), 64);
            document.getElementById("roadmap")!.style.height = `${height}px`;

            // Set the height and width of the slide previews based on the new height of the roadmap
            const slidePreviews: HTMLCollection = document.getElementsByClassName("slide-preview");
            for (let i = 0; i < slidePreviews.length; i++) {
                (slidePreviews[i] as HTMLDivElement).style.height = `${height - 42}px`;
                (slidePreviews[i] as HTMLDivElement).style.width = `${(height - 42) * 16 / 9}px`;
            }
        }

        function end(): void {
            document.removeEventListener("mousemove", preview);
            document.removeEventListener("mouseup", end);
        }
    }

    private addSlide(event: Event): void {
        this.$store.commit("addSlide", this.$store.getters.slides.length);
        this.$store.commit("activeSlide", this.$store.getters.lastSlide.id);
        this.$store.commit("focusGraphic", undefined);
        this.$store.commit("styleEditorObject", undefined);
    }
}
</script>

<style lang="scss" scoped>
@import "../styles/application";

#roadmap {
    position: relative;
    box-sizing: border-box;
    border-top: 1px solid $color-tertiary;
    height: 96px;
}

#slide-previews {
    height: 100%;
    min-width: 100%;
    overflow-x: auto;
    display: flex;
    align-items: center;
    padding: 0 12px;
    box-sizing: border-box;
}

::-webkit-scrollbar {
    display: none;
}

#new-slide-button {
    display: flex;
    justify-content: center;
    align-items: center;
    color: $color-tertiary;
}
</style>
