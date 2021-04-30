<template>
    <div ref='root' :style='style.videoEditorForm'>
        <div :style='style.row'>
            <NumberField
                :name='"x"'
                :labelText='"X"'
                :value='x'
                @deck-input='value => x = value'
            />
            <NumberField
                :name='"y"'
                :labelText='"Y"'
                :value='y'
                @deck-input='value => y = value'
            />
        </div>
        <div :style='style.row'>
            <NumberField
                :name='"width"'
                :labelText='"W"'
                :value='width'
                @deck-input='value => width = value'
                :min='0'
            />
            <NumberField
                :name='"height"'
                :labelText='"H"'
                :value='height'
                @deck-input='value => height = value'
                :min='0'
            />
        </div>
        <div :style='style.row'>
            <NumberField
                :name='"rotation"'
                :labelIcon='"fas fa-sync-alt"'
                :value='rotation'
                @deck-input='value => rotation = value'
            />
        </div>
    </div>
</template>

<script lang='ts'>
import { degToRad, radToDeg } from '@/utilities/utilities';
import V from '@/utilities/Vector';
import { computed, defineComponent, PropType, reactive } from 'vue';
import DeckComponent from '../generic/DeckComponent';
import { NumberField } from '../Core/Forms';
import { correctForRotationWhenChangingDimensions } from './utilities';
import { VideoSerialized } from '@/types';
import { GRAPHIC_TYPES } from '@/rendering/types';

const VideoEditorForm = defineComponent({
    components: {
        NumberField
    },
    props: {
        video: { type: Object as PropType<VideoSerialized>, required: true },
        slideId: { type: String, required: true }
    },
    setup: props => {
        const { root, store, baseStyle } = DeckComponent();
        const style = reactive({
            videoEditorForm: computed(() => ({
                boxSizing: 'border-box',
                padding: '4px'
            })),
            row: computed(() => ({
                ...baseStyle.value.flexRow
            })),
            column: computed(() => ({
                ...baseStyle.value.flexCol
            }))
        });

        const x = computed({
            get: () => props.video.origin.x,
            set: value => {
                store.mutations.setProps(props.slideId, props.video.id, GRAPHIC_TYPES.VIDEO, { origin: { x: value } });
            }
        });
        const y = computed({
            get: () => props.video.origin.y,
            set: value => {
                store.mutations.setProps(props.slideId, props.video.id, GRAPHIC_TYPES.VIDEO, { origin: { y: value } });
            }
        });
        const width = computed({
            get: () => props.video.dimensions.x,
            set: value => {
                const height = value * props.video.dimensions.y / props.video.dimensions.x;
                const newOrigin = correctForRotationWhenChangingDimensions({
                    basePoint: V.from(props.video.origin),
                    initialDimensions: new V(props.video.dimensions.x, props.video.dimensions.y),
                    newDimensions: new V(value, height),
                    rotation: props.video.rotation
                });

                store.mutations.setProps(props.slideId, props.video.id, GRAPHIC_TYPES.VIDEO, {
                    origin: {
                        x: newOrigin.x === props.video.origin.x ? undefined : newOrigin.x,
                        y: newOrigin.y === props.video.origin.y ? undefined : newOrigin.y
                    },
                    dimensions: {
                        x: value,
                        y: height === props.video.dimensions.y ? undefined : height
                    }
                });
            }
        });
        const height = computed({
            get: () => props.video.dimensions.y,
            set: value => {
                const width = value * props.video.dimensions.x / props.video.dimensions.y;
                const newOrigin = correctForRotationWhenChangingDimensions({
                    basePoint: V.from(props.video.origin),
                    initialDimensions: new V(props.video.dimensions.x, props.video.dimensions.y),
                    newDimensions: new V(width, value),
                    rotation: props.video.rotation
                });

                store.mutations.setProps(props.slideId, props.video.id, GRAPHIC_TYPES.VIDEO, {
                    origin: {
                        x: newOrigin.x === props.video.origin.x ? undefined : newOrigin.x,
                        y: newOrigin.y === props.video.origin.y ? undefined : newOrigin.y
                    },
                    dimensions: {
                        x: width === props.video.dimensions.x ? undefined : width,
                        y: value
                    }
                });
            }
        });
        const rotation = computed({
            get: () => radToDeg(props.video.rotation),
            set: value => {
                store.mutations.setProps(props.slideId, props.video.id, GRAPHIC_TYPES.VIDEO, { rotation: degToRad(value) });
            }
        });

        return {
            root,
            style,
            x,
            y,
            width,
            height,
            rotation
        };
    }
});

export default VideoEditorForm;
</script>
