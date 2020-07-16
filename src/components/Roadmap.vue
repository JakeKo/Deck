<template>
<div :style="roadmapStyle">
    <roadmap-slot v-for='slide in getRoadmapSlides'
        :key='slide.id'
        :id='slide.id'
        :isActive='slide.isActive'
    />
    <div :style="addSlideSlotStyle" @click='createNewSlide'>
        <div :style="addSlideLabelStyle">Add Slide</div>
        <div :style="addSlideButtonStyle">
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
import { StyleCreator } from '../styling/types';
import DeckComponent from './generic/DeckComponent';

type StyleProps = {};
type Style = {
    roadmap: any;
    addSlideSlot: any;
    addSlideLabel: any;
    addSlideButton: any;
};
const componentStyle: StyleCreator<StyleProps, Style> = ({ theme, base, props }) => ({
    roadmap: {
        boxSizing: 'border-box',
        borderTop: `1px solid ${theme.color.base.flush}`,
        height: '80px',
        ...base.flexRow,
        flexShrink: '0',
        overflowX: 'scroll'
    },
    addSlideSlot: {
        height: '100%',
        padding: '8px',
        boxSizing: 'border-box',
        ...base.flexColCC,
        justifyContent: 'space-between',
        cursor: 'pointer'
    },
    addSlideLabel: {
        ...base.fontBody
    },
    addSlideButton: {
        height: '45px',
        width: '80px',
        ...base.flexRowCC,
        color: theme.color.base.highest,
        background: theme.color.primary.flush
    }
});

@Component({
    components: {
        RoadmapSlot
    }
})
export default class Roadmap extends DeckComponent<StyleProps, Style> {
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

    private get roadmapStyle(): void {
        const style = this[GETTERS.STYLE]({}, componentStyle);
        return style.roadmap;
    }

    private get addSlideSlotStyle(): void {
        const style = this[GETTERS.STYLE]({}, componentStyle);
        return style.addSlideSlot;
    }

    private get addSlideLabelStyle(): void {
        const style = this[GETTERS.STYLE]({}, componentStyle);
        return style.addSlideLabel;
    }

    private get addSlideButtonStyle(): void {
        const style = this[GETTERS.STYLE]({}, componentStyle);
        return style.addSlideButton;
    }
}
</script>

<style lang="scss" scoped>
::-webkit-scrollbar {
    display: none;
}
</style>
