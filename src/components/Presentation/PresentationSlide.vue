<template>
<svg :style='style.presentationSlide'>
    <component v-for='g in graphics' :key='g.graphic.id' :target='g.graphic' :is='g.component' />
</svg>
</template>

<script lang='ts'>
import { computed, defineComponent, PropType, reactive } from 'vue';
import { useStyle } from '../generic/core';
import { Slide as SlideModel } from '@/store/types';
import { GRAPHIC_TYPES } from '@/rendering/types';
import { SvgRect, SvgEllipse, SvgPath, SvgImage, SvgTextbox, SvgVideo } from './PresentationGraphics';

const PresentationSlide = defineComponent({
    components: {
        SvgRect,
        SvgEllipse,
        SvgPath,
        SvgImage,
        SvgTextbox,
        SvgVideo
    },
    props: {
        slide: { type: Object as PropType<SlideModel>, required: true }
    },
    setup: props => {
        const { baseStyle } = useStyle();
        const style = reactive({
            presentationSlide: computed(() => ({
                ...baseStyle.value.fullScreen
            }))
        });

        // Create a map of components that can be rendered and the component used to render them
        const graphicComponentMap: { [key: string]: string } = {
            [GRAPHIC_TYPES.CURVE]: 'SvgPath',
            [GRAPHIC_TYPES.ELLIPSE]: 'SvgEllipse',
            [GRAPHIC_TYPES.IMAGE]: 'SvgImage',
            [GRAPHIC_TYPES.RECTANGLE]: 'SvgRect',
            [GRAPHIC_TYPES.TEXTBOX]: 'SvgTextbox',
            [GRAPHIC_TYPES.VIDEO]: 'SvgVideo'
        };
        const graphics = computed(() => Object.values(props.slide.graphics)
            .filter(g => Object.keys(graphicComponentMap).includes(g.type))
            .map(g => ({ graphic: g, component: graphicComponentMap[g.type] })));

        return {
            style,
            graphics
        };
    }
});

export default PresentationSlide;
</script>
