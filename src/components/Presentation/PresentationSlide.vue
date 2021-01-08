<template>
<svg :style='style.presentationSlide'>
    <SvgRect v-for='r in rectangles' :key='r.id' :rectangle='r' />
</svg>
</template>

<script lang='ts'>
import { computed, defineComponent, PropType, reactive } from 'vue';
import { useStyle } from '../generic/core';
import { Slide as SlideModel } from '@/store/types';
import { GRAPHIC_TYPES } from '@/rendering/types';
import SvgRect from './SvgRect.vue';

const PresentationSlide = defineComponent({
    components: {
        SvgRect
    },
    props: {
        slide: { type: Object as PropType<SlideModel>, required: true }
    },
    setup: props => {
        const { baseStyle } = useStyle();
        const style = reactive({
            presentationSlide: computed(() => ({
                ...baseStyle.value.fullScreen,
                display: props.slide.isActive ? 'initial' : 'none'
            }))
        });

        const rectangles = computed(() => Object.values(props.slide.graphics).filter(g => g.type === GRAPHIC_TYPES.RECTANGLE));

        return {
            style,
            rectangles
        };
    }
});

export default PresentationSlide;
</script>
