<template>
    <div :style='roadmapSlotStyle' @click='() => setActiveSlideId(id)'>
        <div :style="slideTopicStyle">Topic</div>
        <canvas :style="slidePreviewStyle" />
    </div>
</template>

<script lang='ts'>
import { Vue, Component, Prop } from 'vue-property-decorator';
import { MUTATIONS, GETTERS } from '../store/types';
import { Mutation } from 'vuex-class';
import { StyleCreator } from '../styling/types';
import DeckComponent from './generic/DeckComponent';

type StyleProps = {};
type Style = {
    roadmapSlot: any;
    slideTopic: any;
    slidePreview: any;
    activeSlidePreview: any;
};
const componentStyle: StyleCreator<StyleProps, Style> = ({ theme, base, props }) => ({
    roadmapSlot: {
        height: '100%',
        padding: '8px',
        boxSizing: 'border-box',
        ...base.flexColCC,
        justifyContent: 'space-between',
        cursor: 'pointer'
    },
    slideTopic: {
        ...base.fontBody
    },
    slidePreview: {
        height: '45px',
        width: '80px',
        border: `2px solid ${theme.color.base.flush}`,
        boxSizing: 'border-box'
    },
    activeSlidePreview: {
        border: `2px solid ${theme.color.primary.flush}`
    }
});

@Component
export default class RoadmapSlot extends DeckComponent<StyleProps, Style> {
    @Prop({ type: String, required: true }) private id!: string;
    @Prop({ type: Boolean, required: true }) private isActive!: boolean;
    @Mutation private [MUTATIONS.ACTIVE_SLIDE_ID]: (id: string) => void;

    private get roadmapSlotStyle(): any {
        const style = this[GETTERS.STYLE]({}, componentStyle);
        return style.roadmapSlot;
    }

    private get slideTopicStyle(): any {
        const style = this[GETTERS.STYLE]({}, componentStyle);
        return style.slideTopic;
    }

    private get slidePreviewStyle(): any {
        const style = this[GETTERS.STYLE]({}, componentStyle);
        return {
            ...style.slidePreview,
            ...this.isActive && style.activeSlidePreview
        };
    }
}
</script>
