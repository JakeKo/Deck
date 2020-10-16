<template>
<div ref='root' :style='style.roadmapSlot' @click='() => setActiveSlide(id)'>
    <div :style="style.slideTopic">Topic</div>
    <svg ref='canvas' :viewBox="previewViewbox" :style="style.slidePreview" />
</div>
</template>

<script lang='ts'>
import { defineComponent, computed, reactive, onMounted, ref, onBeforeUnmount } from 'vue';
import { useHover, useStyle } from './generic/core';
import { useStore } from '@/store';

const RoadmapCard = defineComponent({
    props: {
        id: { type: String, required: true },
        isActive: { type: Boolean, required: true }
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
                ...baseStyle.value.cardHigher
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
                throw new Error('Canvas ref not specified.');
            }

            const source = document.querySelector(`#slide_${props.id} svg`) as SVGElement;
            canvas.value.innerHTML = source.innerHTML;
        }

        onMounted(() => {
            refresh();
            refreshInterval = setInterval(refresh, 5000);
        });

        onBeforeUnmount(() => clearInterval(refreshInterval));

        return {
            root,
            canvas,
            style,
            previewViewbox,
            setActiveSlide: store.mutations.setActiveSlide
        };
    }
});

export default RoadmapCard;
</script>
