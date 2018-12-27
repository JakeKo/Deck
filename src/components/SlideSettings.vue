<template>
<div id="slide-settings">
    <div class="slide-setting">
        <i class="zoom-icon fas fa-search-plus" @click="$store.commit('canvasZoom', $store.getters.canvasZoom + 0.05)"></i>
        <input id="zoom-field" type="number" :value="zoomValue" @blur="zoomValue = $event.target.valueAsNumber"/>
        <i class="zoom-icon fas fa-search-minus" @click="$store.commit('canvasZoom', $store.getters.canvasZoom  - 0.05)"></i>
    </div>
</div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

@Component
export default class SlideSettings extends Vue {
    get zoomValue(): number {
        return Math.round(this.$store.getters.canvasZoom * 100);
    }

    set zoomValue(zoomValue: number) {
        this.$store.commit("canvasZoom", zoomValue / 100);
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
}

.slide-setting {
    display: flex;
    flex-direction: column;
    padding: 8px 0;
    align-items: center;
}

.zoom-icon {
    cursor: pointer;
}

#zoom-field {
    width: 75%;
    outline: none;
    border: none;
    text-align: center;
    margin: 8px 0;
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
