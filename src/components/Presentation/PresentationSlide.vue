<template>
<svg :style='style.presentationSlide' :viewBox='viewbox'>
    <component v-for='g in graphics' :key='g.graphic.id' :target='g.graphic' :is='g.component' />
</svg>
</template>

<script lang='ts'>
import { computed, defineComponent, PropType, reactive, ref } from 'vue';
import { useStyle } from '../generic/core';
import { Slide as SlideModel } from '@/store/types';
import { GRAPHIC_TYPES } from '@/rendering/types';
import { SvgRect, SvgEllipse, SvgPath, SvgImage, SvgTextbox, SvgVideo } from './PresentationGraphics';
import { useStore } from '@/store';

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
        const { baseTheme } = useStyle();
        const store = useStore();

        // Take window size into account to make sure that the slide fits within the current window (even after resizing)
        const windowWidth = ref(window.innerWidth);
        const windowHeight = ref(window.innerHeight);
        const viewbox = store.state.editorViewbox.cropped;
        const slideScale = computed(() => Math.min(windowWidth.value / viewbox.width, windowHeight.value / viewbox.height));
        window.addEventListener('resize', () => {
            windowWidth.value = window.innerWidth;
            windowHeight.value = window.innerHeight;
        });

        const style = reactive({
            presentationSlide: computed(() => ({
                width: `${viewbox.width * slideScale.value}px`,
                height: `${viewbox.height * slideScale.value}px`,
                backgroundColor: baseTheme.value.color.base.highest
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
            graphics,
            viewbox: `${viewbox.x} ${viewbox.y} ${viewbox.width} ${viewbox.height}`
        };
    }
});

export default PresentationSlide;
</script>
