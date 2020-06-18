<template>
<div id='roadmap'>
    <roadmap-slide v-for='slide in $store.getters.roadmapSlides'
        :key='slide.id'
        :id='slide.id'
        :isActive='slide.id === $store.getters.activeSlide.id'
    />
    <div id='add-slide-button' @click='addSlide'></div>
</div>
</template>

<script lang='ts'>
import { Vue, Component } from 'vue-property-decorator';
import RoadmapSlide from './RoadmapSlide.vue';

@Component({
    components: {
        RoadmapSlide
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
    height: 80px;
    display: flex;
    flex-shrink: 0;
}

#add-slide-button {
    height: 100%;
    width: 100px;
    background: purple;
}

::-webkit-scrollbar {
    display: none;
}
</style>
