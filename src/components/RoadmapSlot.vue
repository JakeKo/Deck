<template>
<div :style='roadmapSlotStyle' @click='() => setActiveSlideId(id)'>
    <div :style="slideTopicStyle">Topic</div>
    <svg ref='canvas' :viewBox="previewViewbox" :style="slidePreviewStyle" />
</div>
</template>

<script lang='ts'>
import { Vue, Component, Prop } from 'vue-property-decorator';
import { MUTATIONS, GETTERS, Viewbox } from '../store/types';
import { Getter, Mutation } from 'vuex-class';
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
    @Getter private [GETTERS.CROPPED_VIEWBOX]: Viewbox;
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

    private get previewViewbox(): string {
        const viewbox = this[GETTERS.CROPPED_VIEWBOX];
        return `${viewbox.x} ${viewbox.y} ${viewbox.width} ${viewbox.height}`;
    }

    // TODO: Determine how to ignore helper graphics when updating preview
    public mounted(): void {
        this.bindEvents();
        setInterval(async () => {
            const source = document.querySelector(`#slide_${this.id} svg`) as SVGElement;
            const target = this.$refs['canvas'] as SVGElement;
            target.innerHTML = source.innerHTML;
        }, 5000);
    }
}
</script>
