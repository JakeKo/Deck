<template>
<foreignObject
    :x='x'
    :y='y'
    :width='width'
    :height='height'
    :style='style'
    :transform-origin='transformOrigin'
>
    <video
        :width='width'
        :height='height'
    >
        <source :src='source' />
    </video>
</foreignObject>
</template>

<script lang='ts'>
import { defineComponent, PropType } from 'vue';
import { VideoSerialized } from '@/types';

const SvgVideo = defineComponent({
    props: {
        target: { type: Object as PropType<VideoSerialized>, required: true }
    },
    setup: props => {
        const style: { [key: string]: string } = {
            transform: `rotate(${props.target.rotation}rad)`
        };

        return {
            source: props.target.source,
            x: props.target.origin.x,
            y: props.target.origin.y,
            width: props.target.dimensions.x,
            height: props.target.dimensions.y,
            style: Object.keys(style).map(key => `${key}:${style[key]}`).join(';'),
            transformOrigin: `${props.target.origin.x + props.target.dimensions.x / 2}px ${props.target.origin.y + props.target.dimensions.y / 2}px`
        };
    }
});

export default SvgVideo;
</script>
