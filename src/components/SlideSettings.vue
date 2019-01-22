<template>
<div id="slide-settings">
    <div class="slide-setting">
        <div class="zoom-icon" @mousedown="modifyZoom(0.05)" @mouseup="loopModify = false">
            <i class="fas fa-search-plus"></i>
        </div>
        
        <input id="zoom-field" type="number" :value="zoomValue" @blur="zoomValue = $event.target.valueAsNumber" @keydown="$event.stopPropagation()" autocomplete="false"/>
        
        <div class="zoom-icon" @mousedown="modifyZoom(-0.05)" @mouseup="loopModify = false">
            <i class="fas fa-search-minus"></i>
        </div>
    </div>
</div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

@Component
export default class SlideSettings extends Vue {
    private loopModify: boolean = false;

    get zoomValue(): number {
        return Math.round(this.$store.getters.canvasZoom * 100);
    }

    set zoomValue(zoomValue: number) {
        this.$store.commit("canvasZoom", zoomValue / 100);
    }

    private modifyZoom(modification: number): void {
        const self: SlideSettings = this;
        function modify(): void {
            if (!self.loopModify) {
                return;
            }

            self.$store.commit("canvasZoom", self.$store.getters.canvasZoom + modification);
            setTimeout(modify, 150);
        }

        this.loopModify = true;
        this.$store.commit("canvasZoom", this.$store.getters.canvasZoom + modification);
        setTimeout(modify, 500);
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
    padding: 4px 0;
}

#zoom-field {
    width: 75%;
    outline: none;
    border: none;
    text-align: center;
    margin: 4px 0;
    padding: 2px 0;
    font-family: $font-body;
    font-size: 14px;

    &:focus {
        background: $color-tertiary;
    }
    
    &::-webkit-outer-spin-button, &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
}
</style>
