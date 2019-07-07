<template>
<div id="slide-settings">
    <div class="slide-setting">
        <div class="zoom-icon" @mousedown="zoomIn"><i class="fas fa-search-plus"></i></div>
        <input id="zoom-field" type="number" v-model="zoom" @keydown="handleKeydown" autocomplete="off"/>
        <div class="zoom-icon" @mousedown="zoomOut"><i class="fas fa-search-minus"></i></div>
    </div>
</div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

@Component
export default class SlideSettings extends Vue {
    get zoom(): number {
        return Math.round(this.$store.getters.canvasZoom * 100);
    }

    set zoom(zoom: number) {
        this.$store.commit("canvasZoom", zoom / 100);
    }

    private handleKeydown(event: KeyboardEvent): void {
        // Prevent propagation so pressing "Delete" or "Backspace" won't remove graphics from the active slide
        // TODO: Devise better way to handle removing graphics such that graphics are only removed if a delete-ish key is pressed while the editor is "focused"
        event.stopPropagation();

        // Submit the input field if "Tab" or "Enter" is pressed
        if (["Tab", "Enter"].indexOf(event.key) !== -1) {
            (event.target as HTMLInputElement).blur();
        }
    }

    private zoomOut(event: MouseEvent): void {
        const self: SlideSettings = this;
        self.$store.commit("canvasZoom", self.$store.getters.canvasZoom - 0.05);

        let zoomTimeout: number = window.setTimeout(performZoom, 500);
        event.target!.addEventListener("mouseup", function(): void {
            window.clearTimeout(zoomTimeout);
        });

        function performZoom(): void {
            self.$store.commit("canvasZoom", self.$store.getters.canvasZoom - 0.05);
            zoomTimeout = window.setTimeout(performZoom, 150);
        }
    }

    private zoomIn(event: MouseEvent): void {
        const self: SlideSettings = this;
        self.$store.commit("canvasZoom", self.$store.getters.canvasZoom + 0.05);

        let zoomTimeout: number = window.setTimeout(performZoom, 500);
        event.target!.addEventListener("mouseup", function(): void {
            window.clearTimeout(zoomTimeout);
        });

        function performZoom(): void {
            self.$store.commit("canvasZoom", self.$store.getters.canvasZoom + 0.05);
            zoomTimeout = window.setTimeout(performZoom, 150);
        }
    }
}
</script>

<style lang="scss" scoped>
@import "../styles/application";

#slide-settings {
    background: $color-light;
    border-right: 1px solid $color-tertiary;
    box-sizing: border-box;
    width: 48px;
    flex-shrink: 0;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    padding: 8px 0;
}

.slide-setting {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.zoom-icon {
    cursor: pointer;
    display: flex;
    justify-content: center;
    width: 100%;
    padding: 6px 0;
    transition: 0.25s;

    &:hover {
        background: $color-secondary;
    }
}

#zoom-field {
    width: 100%;
    outline: none;
    border: none;
    text-align: center;
    padding: 4px 0;
    font-family: $font-body;
    font-size: 14px;
    transition: 0.25s;

    &:hover {
        background: $color-secondary;
    }

    &:focus {
        background: $color-tertiary;
    }
    
    &::-webkit-outer-spin-button, &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
}
</style>
