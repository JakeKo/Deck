<template>
<div id='roadmap'>
    <roadmap-slot v-for='slide in getRoadmapSlides'
        :key='slide.id'
        :id='slide.id'
        :isActive='slide.isActive'
    />
    <div id='add-slide-slot' @click='createNewSlide'>
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
import { MUTATIONS, GETTERS, RoadmapSlide, Slide } from '../store/types';
import { Getter, Mutation } from 'vuex-class';

@Component({
    components: {
        RoadmapSlot
    }
})
export default class Roadmap extends Vue {
    @Getter private [GETTERS.ROADMAP_SLIDES]: RoadmapSlide[];
    @Getter private [GETTERS.ACTIVE_SLIDE]: Slide;
    @Getter private [GETTERS.SLIDES]: Slide[];
    @Getter private [GETTERS.LAST_SLIDE]: Slide;
    @Mutation private [MUTATIONS.ADD_SLIDE]: (index: number) => void;
    @Mutation private [MUTATIONS.ACTIVE_SLIDE_ID]: (id: string) => void;

    private createNewSlide(): void {
        this[MUTATIONS.ADD_SLIDE](this[GETTERS.SLIDES].length);
        this[MUTATIONS.ACTIVE_SLIDE_ID](this[GETTERS.LAST_SLIDE].id);
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
    overflow-x: scroll;
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
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    background: $color-information;
}

::-webkit-scrollbar {
    display: none;
}
</style>
