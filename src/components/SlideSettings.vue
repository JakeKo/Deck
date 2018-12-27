<template>
<div id="slide-settings">
    <div class="slide-setting">
        <div class="zoom-icon">
            <i class="fas fa-search-plus" @mousedown="modifyZoom(0.05)" @mouseup="loopModify = false"></i>
        </div>
        <input id="zoom-field" type="number" :value="zoomValue" @blur="zoomValue = $event.target.valueAsNumber"/>
        <div class="zoom-icon">
            <i class="fas fa-search-minus" @mousedown="modifyZoom(-0.05)" @mouseup="loopModify = false"></i>
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
        const modify: () => void = (): void => {
            if (!this.loopModify) {
                return;
            }

            this.$store.commit("canvasZoom", this.$store.getters.canvasZoom + modification);
            setTimeout(modify, 250);
        };

        this.loopModify = true;
        this.$store.commit("canvasZoom", this.$store.getters.canvasZoom + modification);
        setTimeout(modify, 750);
    }
}
</script>

<style lang="scss" scoped>
@import "../styles/components";

#slide-settings {
    background: $color-light;
    border-right: 1px solid $color-tertiary;
    width: 48px;
    flex-shrink: 0;
    height: 100%;
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
