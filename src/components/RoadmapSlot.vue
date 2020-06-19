<template>
    <div class='roadmap-slot' @click='activateSlide'>
        <div class='slide-topic'>Topic</div>
        <canvas :class='{ "slide-preview": true, "active-slide-preview": isActive }' />
    </div>
</template>

<script lang='ts'>
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class RoadmapSlot extends Vue {
    @Prop({ type: String, required: true }) private id!: string;
    @Prop({ type: Boolean, required: true }) private isActive!: boolean;

    private activateSlide(): void {
        this.$store.commit('setActiveSlideId', this.id);
    }
}
</script>

<style lang='scss' scoped>
@import '../styles/colors';

.roadmap-slot {
    height: 100%;
    padding: 8px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
}

.slide-topic {
    font-family: 'Roboto', sans-serif;
    font-size: 14px;
}

.slide-preview {
    height: 45px;
    width: 80px;
    border: 2px solid $color-tertiary;
}

.active-slide-preview {
    border: 2px solid $color-information;
}
</style>
