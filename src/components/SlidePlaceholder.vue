<template>
    <div id='empty-slide-container' :style='emptySlideContainerStyle'>
        <div id='empty-slide' :style='emptySlideStyle'>
            Click "Add Slide" to start your deck 😎😎
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { GETTERS, Viewbox } from '../store/types';
import { Getter } from 'vuex-class';

@Component
export default class SlidePlaceholder extends Vue {
    @Getter private [GETTERS.RAW_VIEWBOX]: Viewbox;
    @Getter private [GETTERS.CROPPED_VIEWBOX]: Viewbox;

    private get emptySlideContainerStyle(): { minWidth: string; minHeight: string; } {
        return {
            minWidth: `${this[GETTERS.RAW_VIEWBOX].width}px`,
            minHeight: `${this[GETTERS.RAW_VIEWBOX].height}px`
        };
    }

    private get emptySlideStyle(): { width: string; height: string; } {
        return {
            width: `${this[GETTERS.CROPPED_VIEWBOX].width}px`,
            height: `${this[GETTERS.CROPPED_VIEWBOX].height}px`
        };
    }
}
</script>

<style lang="scss" scoped>
#empty-slide-container {
    display: flex;
    justify-content: center;
    align-items: center;
}

#empty-slide {
    border: 4px dashed grey;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 24px;
    font-family: 'Roboto', sans-serif;
}
</style>
