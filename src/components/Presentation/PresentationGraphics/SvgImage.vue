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
import { ImageStoreModel } from '@/store/types';

const SvgImage = defineComponent({
    props: {
        image: { type: Object as PropType<ImageStoreModel>, required: true }
    },
    setup: props => {
        const style: { [key: string]: string } = {
            transform: `rotate(${props.image.rotation}rad)`
        };

        return {
            href: props.image.source,
            x: props.image.origin.x,
            y: props.image.origin.y,
            width: props.image.width,
            height: props.image.height,
            style: Object.keys(style).map(key => `${key}:${style[key]}`).join(';'),
            transformOrigin: `${props.image.origin.x + props.image.width / 2}px ${props.image.origin.y + props.image.height / 2}px`
        };
    }
});

export default SvgImage;
</script>
