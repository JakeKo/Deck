<template>
<div :style='style.roadmapSlot' @mousedown='addSlide'>
    <div :style="style.slideTopic">Add Slide</div>
    <div :style="style.addSlidePreview">
        <i class='fas fa-plus' />
    </div>
</div>
</template>

<script lang='ts'>
import { defineComponent, computed, reactive } from 'vue';
import { useStyle } from '../generic/core';
import { useStore } from '@/store';

const StandardRoadmapCard = defineComponent({
    setup: () => {
        const { baseStyle, baseTheme } = useStyle();
        const store = useStore();

        const style = reactive({
            roadmapSlot: computed(() => ({
                height: '100%',
                cursor: 'pointer',
                width: '96px',
                transition: '0.25s',
                flexShrink: '0',
                ...baseStyle.value.flexColCC,
                background: baseTheme.value.color.base.highest
            })),
            slideTopic: computed(() => ({
                ...baseStyle.value.fontLabel,
                width: '100%',
                textAlign: 'center'
            })),
            addSlidePreview: computed(() => ({
                height: '45px',
                width: '80px',
                ...baseStyle.value.cardHigher,
                ...baseStyle.value.flexRowCC,
                color: baseTheme.value.color.base.highest,
                background: baseTheme.value.color.primary.flush
            }))
        });

        function addSlide(): void {
            store.mutations.addSlide(store.state.slides.length);

            const lastSlide = store.state.slides[store.state.slides.length - 1];
            if (lastSlide === undefined) {
                throw new Error('Failed to create new slide');
            }

            store.mutations.setActiveSlide(lastSlide.id);
        }

        return {
            style,
            addSlide
        };
    }
});

export default StandardRoadmapCard;
</script>
