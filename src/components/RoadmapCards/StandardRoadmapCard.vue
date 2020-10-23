<template>
<div ref='root' :style='style.roadmapSlot' @mousedown='handleMouseDown' @mouseover='handleMouseOver'>
    <div :style='style.slideTopic'>Topic</div>
    <svg ref='canvas' :viewBox='previewViewbox' :style='style.slidePreview' />
</div>
</template>

<script lang='ts'>
import { defineComponent, computed, reactive, onMounted, ref, onBeforeUnmount } from 'vue';
import { useHover, useStyle } from '../generic/core';
import { useStore } from '@/store';
import { listenOnce } from '@/events/utilities';

const StandardRoadmapCard = defineComponent({
    props: {
        id: { type: String, required: true },
        isActive: { type: Boolean, required: true }
    },
    emits: ['deck-roadmap-card-mousedown', 'deck-roadmap-card-mousedownhold', 'deck-roadmap-card-mouseover'],
    setup: (props, { emit }) => {
        const { target: root, isHovered } = useHover();
        const { baseStyle, baseTheme } = useStyle();
        const store = useStore();

        const style = reactive({
            roadmapSlot: computed(() => ({
                height: '100%',
                cursor: 'pointer',
                width: '96px',
                transition: '0.25s',
                ...baseStyle.value.flexColCC,
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

        function handleMouseDown(): void {
            emit('deck-roadmap-card-mousedown', props.id);

            const holdDetector = setTimeout(() => emit('deck-roadmap-card-mousedownhold', props.id), 250);
            listenOnce('mouseup', () => clearInterval(holdDetector));
        }

        function handleMouseOver(): void {
            emit('deck-roadmap-card-mouseover');
        }

        return {
            root,
            canvas,
            style,
            previewViewbox,
            handleMouseDown,
            handleMouseOver
        };
    }
});

export default StandardRoadmapCard;
</script>
