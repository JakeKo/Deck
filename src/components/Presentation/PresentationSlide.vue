<template>
<svg :style='style.presentationSlide'>
    <SvgRect v-for='r in rectangles' :key='r.id' :rectangle='r' />
    <SvgEllipse v-for='e in ellipses' :key='e.id' :ellipse='e' />
    <SvgPath v-for='c in curves' :key='c.id' :curve='c' />
</svg>
</template>

<script lang='ts'>
import { computed, defineComponent, PropType, reactive } from 'vue';
import { useStyle } from '../generic/core';
import { Slide as SlideModel } from '@/store/types';
import { GRAPHIC_TYPES } from '@/rendering/types';
import SvgRect from './PresentationGraphics/SvgRect.vue';
import SvgEllipse from './PresentationGraphics/SvgEllipse.vue';
import SvgPath from './PresentationGraphics/SvgPath.vue';

const PresentationSlide = defineComponent({
    components: {
        SvgRect,
        SvgEllipse,
        SvgPath
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
        const ellipses = computed(() => Object.values(props.slide.graphics).filter(g => g.type === GRAPHIC_TYPES.ELLIPSE));
        const curves = computed(() => Object.values(props.slide.graphics).filter(g => g.type === GRAPHIC_TYPES.CURVE));

        return {
            style,
            rectangles,
            ellipses,
            curves
        };
    }
});

export default PresentationSlide;
</script>
