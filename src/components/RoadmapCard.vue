<template>
<div v-if='!isAddSlideCard' ref='root' :style='style.roadmapSlot' @click='() => setActiveSlide(id)'>
    <div :style="style.slideTopic">Topic</div>
    <svg ref='canvas' :viewBox="previewViewbox" :style="style.slidePreview" />
</div>
<div v-else ref='root' :style='style.roadmapSlot' @click='createNewSlide'>
    <div :style="style.slideTopic">Add Slide</div>
    <div :style="style.addSlidePreview">
        <i class='fas fa-plus' />
    </div>
</div>
</template>

<script lang='ts'>
import { defineComponent, computed, reactive, onMounted, ref, onBeforeUnmount } from 'vue';
import { useHover, useStyle } from './generic/core';
import { useStore } from '@/store';

const RoadmapCard = defineComponent({
    props: {
        id: { type: String, required: true },
        isActive: { type: Boolean, required: true },
        isAddSlideCard: { type: Boolean, required: true }
    },
    setup: props => {
        const { target: root, isHovered } = useHover();
        const { baseStyle, baseTheme } = useStyle();
        const store = useStore();

        const style = reactive({
            roadmapSlot: computed(() => ({
                height: '100%',
                cursor: 'pointer',
                padding: '4px',
                boxSizing: 'border-box',
                transition: '0.25s',
                ...baseStyle.value.flexCol,
                background: isHovered.value
                    ? baseTheme.value.color.base.higher
                    : baseTheme.value.color.base.highest
            })),
            slideTopic: computed(() => ({
                ...baseStyle.value.fontLabel,
                width: '100%',
                textAlign: 'center'
            })),
            slidePreview: computed(() => ({
                height: '45px',
                width: '80px',
                boxSizing: 'border-box',
                transition: '0.25s',
                border: props.isActive ? `1px solid ${baseTheme.value.color.basecomp.flush}` : 'none',
                ...baseStyle.value.cardHigher
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
        const previewViewbox = computed(() => {
            const viewbox = store.state.editorViewbox.cropped;
            return `${viewbox.x} ${viewbox.y} ${viewbox.width} ${viewbox.height}`;
        });
        const canvas = ref<SVGElement | undefined>(undefined);
        let refreshInterval: number;

        // TODO: Determine how to ignore helper graphics when updating preview
        async function refresh() {
            if (canvas.value === undefined) {
                return;
            }

            const source = document.querySelector(`#slide_${props.id} svg`) as SVGElement;
            canvas.value.innerHTML = source.innerHTML;
        }

        onMounted(() => {
            refresh();
            refreshInterval = setInterval(refresh, 5000);
        });

        onBeforeUnmount(() => clearInterval(refreshInterval));

        function createNewSlide(): void {
            store.mutations.addSlide(store.state.slides.length);

            const lastSlide = store.state.slides[store.state.slides.length - 1];
            if (lastSlide === undefined) {
                throw new Error('Failed to create new slide');
            }

            store.mutations.setActiveSlide(lastSlide.id);
        }

        return {
            root,
            canvas,
            style,
            previewViewbox,
            setActiveSlide: store.mutations.setActiveSlide,
            createNewSlide
        };
    }
});

export default RoadmapCard;
</script>
