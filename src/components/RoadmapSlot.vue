<template>
<div ref='root' :style='style.roadmapSlot' @click='() => setActiveSlide(id)'>
    <div :style="style.slideTopic">Topic</div>
    <svg ref='canvas' :viewBox="previewViewbox" :style="style.slidePreview" />
</div>
</template>

<script lang='ts'>
import DeckComponent from './generic/DeckComponent';
import { defineComponent, computed, reactive, onMounted, ref } from 'vue';

const RoadmapSlot = defineComponent({
    props: {
        id: { type: String, required: true },
        isActive: { type: Boolean, required: true }
    },
    setup: props => {
        const { root, store, baseStyle, baseTheme } = DeckComponent();
        const style = reactive({
            roadmapSlot: computed(() => ({
                height: '100%',
                padding: '8px',
                boxSizing: 'border-box',
                ...baseStyle.value.flexColCC,
                justifyContent: 'space-between',
                cursor: 'pointer'
            })),
            slideTopic: computed(() => ({
                ...baseStyle.value.fontBody
            })),
            slidePreview: computed(() => ({
                height: '45px',
                width: '80px',
                border: props.isActive
                    ? `2px solid ${baseTheme.value.color.primary.flush}`
                    : `2px solid ${baseTheme.value.color.base.flush}`,
                boxSizing: 'border-box'
            }))
        });
        const previewViewbox = computed(() => {
            const viewbox = store.croppedViewbox.value;
            return `${viewbox.x} ${viewbox.y} ${viewbox.width} ${viewbox.height}`;
        });
        const canvas = ref<SVGElement | undefined>(undefined);

        // TODO: Determine how to ignore helper graphics when updating preview
        onMounted(() => {
            setInterval(async() => {
                if (canvas.value === undefined) {
                    throw new Error('Canvas ref not specified.');
                }

                const source = document.querySelector(`#slide_${props.id} svg`) as SVGElement;
                canvas.value.innerHTML = source.innerHTML;
            }, 5000);
        });

        return {
            root,
            canvas,
            style,
            previewViewbox,
            setActiveSlide: store.setActiveSlide
        };
    }
});

export default RoadmapSlot;
</script>
