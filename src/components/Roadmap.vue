<template>
<div id='roadmap'>
    <roadmap-slot v-for='slide in $store.getters.roadmapSlides'
        :key='slide.id'
        :id='slide.id'
        :isActive='slide.id === $store.getters.activeSlide.id'
    />
    <div id='add-slide-slot' @click='addSlide'>
        <div id='add-slide-label'>Add Slide</div>
        <div id='add-slide-button'>
            <i class='fas fa-plus' />
        </div>
    </div>
</div>
</template>

<script lang='ts'>
import { Vue, Component } from 'vue-property-decorator';
import RoadmapSlot from './RoadmapSlot.vue';

@Component({
    components: {
        RoadmapSlot
    }
})
export default class Roadmap extends Vue {
    private addSlide(): void {
        this.$store.commit('addSlide', this.$store.getters.slides.length);
        this.$store.commit('setActiveSlideId', this.$store.getters.lastSlide.id);
    }
}
</script>

<style lang='scss' scoped>
@import '../styles/application';

#roadmap {
    box-sizing: border-box;
    border-top: 1px solid $color-tertiary;
    height: 84px;
    display: flex;
    flex-shrink: 0;
}

#add-slide-slot {
    height: 100%;
    padding: 8px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
}

#add-slide-label {
    font-family: 'Roboto', sans-serif;
    font-size: 14px;
}

#add-slide-button {
    height: 45px;
    width: 80px;
    border: 2px solid $color-tertiary;
    display: flex;
    justify-content: center;
    align-items: center;
    color: $color-tertiary;
}

::-webkit-scrollbar {
    display: none;
}
</style>
