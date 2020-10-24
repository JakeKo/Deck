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
import { VideoStoreModel } from '@/store/types';
import { degToRad, radToDeg } from '@/utilities/utilities';
import Vector from '@/utilities/Vector';
import { computed, defineComponent, PropType, reactive } from 'vue';
import DeckComponent from '../generic/DeckComponent';
import NumberField from '../generic/NumberField.vue';

const VideoEditorForm = defineComponent({
    components: {
        NumberField
    },
    props: {
        video: { type: Object as PropType<VideoStoreModel>, required: true },
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
                store.mutations.setGraphic(props.slideId, { ...props.video, origin: new Vector(value, props.video.origin.y) });
                store.mutations.broadcastSetX(props.slideId, props.video.id, value);
            }
        });
        const y = computed({
            get: () => props.video.origin.y,
            set: value => {
                store.mutations.setGraphic(props.slideId, { ...props.video, origin: new Vector(props.video.origin.x, value) });
                store.mutations.broadcastSetY(props.slideId, props.video.id, value);
            }
        });
        const width = computed({
            get: () => props.video.width,
            set: value => {
                const height = value * props.video.height / props.video.width;
                store.mutations.setGraphic(props.slideId, { ...props.video, width: value, height });
                store.mutations.broadcastSetWidth(props.slideId, props.video.id, value);
                store.mutations.broadcastSetHeight(props.slideId, props.video.id, height);
            }
        });
        const height = computed({
            get: () => props.video.height,
            set: value => {
                const width = value * props.video.width / props.video.height;
                store.mutations.setGraphic(props.slideId, { ...props.video, width, height: value });
                store.mutations.broadcastSetWidth(props.slideId, props.video.id, width);
                store.mutations.broadcastSetHeight(props.slideId, props.video.id, value);
            }
        });
        const rotation = computed({
            get: () => radToDeg(props.video.rotation),
            set: value => {
                store.mutations.setGraphic(props.slideId, { ...props.video, rotation: degToRad(value) });
                store.mutations.broadcastSetRotation(props.slideId, props.video.id, degToRad(value));
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