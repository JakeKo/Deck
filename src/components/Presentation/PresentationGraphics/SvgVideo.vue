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
import { VideoStoreModel } from '@/store/types';

const SvgVideo = defineComponent({
    props: {
        target: { type: Object as PropType<VideoStoreModel>, required: true }
    },
    setup: props => {
        const style: { [key: string]: string } = {
            transform: `rotate(${props.target.rotation}rad)`
        };

        return {
            source: props.target.source,
            x: props.target.origin.x,
            y: props.target.origin.y,
            width: props.target.width,
            height: props.target.height,
            style: Object.keys(style).map(key => `${key}:${style[key]}`).join(';'),
            transformOrigin: `${props.target.origin.x + props.target.width / 2}px ${props.target.origin.y + props.target.height / 2}px`
        };
    }
});

export default SvgVideo;
</script>
