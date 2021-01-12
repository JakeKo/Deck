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
        video: { type: Object as PropType<VideoStoreModel>, required: true }
    },
    setup: props => {
        const style: { [key: string]: string } = {
            transform: `rotate(${props.video.rotation}rad)`
        };

        return {
            source: props.video.source,
            x: props.video.origin.x,
            y: props.video.origin.y,
            width: props.video.width,
            height: props.video.height,
            style: Object.keys(style).map(key => `${key}:${style[key]}`).join(';'),
            transformOrigin: `${props.video.origin.x + props.video.width / 2}px ${props.video.origin.y + props.video.height / 2}px`
        };
    }
});

export default SvgVideo;
</script>
