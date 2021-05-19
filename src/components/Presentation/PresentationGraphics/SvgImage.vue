<template>
<image
    :href='href'
    :x='x'
    :y='y'
    :width='width'
    :height='height'
    :style='style'
    :transform-origin='transformOrigin'
/>
</template>

<script lang='ts'>
import { defineComponent, PropType } from 'vue';
import { ImageSerialized } from '@/types';

const SvgImage = defineComponent({
    props: {
        target: { type: Object as PropType<ImageSerialized>, required: true }
    },
    setup: props => {
        const style: { [key: string]: string } = {
            transform: `rotate(${props.target.rotation}rad)`
        };

        return {
            href: props.target.source,
            x: props.target.origin.x,
            y: props.target.origin.y,
            width: props.target.dimensions.x,
            height: props.target.dimensions.y,
            style: Object.keys(style).map(key => `${key}:${style[key]}`).join(';'),
            transformOrigin: `${props.target.origin.x + props.target.dimensions.x / 2}px ${props.target.origin.y + props.target.dimensions.y / 2}px`
        };
    }
});

export default SvgImage;
</script>
