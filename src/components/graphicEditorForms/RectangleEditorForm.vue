<template>
    <div ref='root' :style='style.rectangleEditorForm'>
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
            <ToggleField
                :name='"lock-aspect-ratio"'
                :labelIconOn='"fas fa-link"'
                :labelIconOff='"fas fa-unlink"'
                :value='lockAspectRatio'
                @deck-input='value => lockAspectRatio = value'
            />
        </div>
        <div :style='style.row'>
            <div :style='style.column'>
                <NumberField
                    :name='"rotation"'
                    :labelIcon='"fas fa-sync-alt"'
                    :value='rotation'
                    @deck-input='value => rotation = value'
                />
                <ColorField
                    :name='"fill-color"'
                    :labelText='"FILL"'
                    :value='fillColor'
                    @deck-input='value => fillColor = value'
                />
            </div>
            <div :style='style.column'>
                <NumberField
                    :name='"stroke-width"'
                    :labelIcon='"fas fa-grip-lines"'
                    :value='strokeWidth'
                    @deck-input='value => strokeWidth = value'
                />
                <ColorField
                    :name='"stroke-color"'
                    :labelText='"STROKE"'
                    :value='strokeColor'
                    @deck-input='value => strokeColor = value'
                />
            </div>
        </div>
    </div>
</template>

<script lang='ts'>
import { RectangleStoreModel } from '@/store/types';
import V from '@/utilities/Vector';
import { computed, defineComponent, PropType, reactive, ref } from 'vue';
import DeckComponent from '../generic/DeckComponent';
import { ColorField, NumberField, ToggleField } from '../Core/Forms';
import { degToRad, radToDeg } from '@/utilities/utilities';
import { correctForRotationWhenChangingDimensions } from './utilities';

const RectangleEditorForm = defineComponent({
    components: {
        NumberField,
        ColorField,
        ToggleField
    },
    props: {
        rectangle: { type: Object as PropType<RectangleStoreModel>, required: true },
        slideId: { type: String, required: true }
    },
    setup: props => {
        const { root, store, baseStyle } = DeckComponent();
        const style = reactive({
            rectangleEditorForm: computed(() => ({
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

        const lockAspectRatio = ref(false);
        const x = computed({
            get: () => props.rectangle.origin.x,
            set: value => {
                store.mutations.setProps(props.slideId, props.rectangle.id, props.rectangle.type, { origin: { x: value } });
            }
        });
        const y = computed({
            get: () => props.rectangle.origin.y,
            set: value => {
                store.mutations.setProps(props.slideId, props.rectangle.id, props.rectangle.type, { origin: { y: value } });
            }
        });
        const width = computed({
            get: () => props.rectangle.width,
            set: value => {
                const height = lockAspectRatio.value
                    ? value * props.rectangle.height / props.rectangle.width
                    : props.rectangle.height;
                const newOrigin = correctForRotationWhenChangingDimensions({
                    basePoint: props.rectangle.origin,
                    initialDimensions: new V(props.rectangle.width, props.rectangle.height),
                    newDimensions: new V(value, height),
                    rotation: props.rectangle.rotation
                });

                store.mutations.setProps(props.slideId, props.rectangle.id, props.rectangle.type, {
                    origin: {
                        x: newOrigin.x === props.rectangle.origin.x ? undefined : newOrigin.x,
                        y: newOrigin.y === props.rectangle.origin.y ? undefined : newOrigin.y
                    },
                    dimensions: {
                        x: value,
                        y: height === props.rectangle.height ? undefined : height
                    }
                });
            }
        });
        const height = computed({
            get: () => props.rectangle.height,
            set: value => {
                const width = lockAspectRatio.value
                    ? value * props.rectangle.width / props.rectangle.height
                    : props.rectangle.width;
                const newOrigin = correctForRotationWhenChangingDimensions({
                    basePoint: props.rectangle.origin,
                    initialDimensions: new V(props.rectangle.width, props.rectangle.height),
                    newDimensions: new V(width, value),
                    rotation: props.rectangle.rotation
                });

                store.mutations.setProps(props.slideId, props.rectangle.id, props.rectangle.type, {
                    origin: {
                        x: newOrigin.x === props.rectangle.origin.x ? undefined : newOrigin.x,
                        y: newOrigin.y === props.rectangle.origin.y ? undefined : newOrigin.y
                    },
                    dimensions: {
                        x: width === props.rectangle.width ? undefined : width,
                        y: value
                    }
                });
            }
        });
        const rotation = computed({
            get: () => radToDeg(props.rectangle.rotation),
            set: value => {
                store.mutations.setProps(props.slideId, props.rectangle.id, props.rectangle.type, { rotation: degToRad(value) });
            }
        });
        const strokeWidth = computed({
            get: () => props.rectangle.strokeWidth,
            set: value => {
                store.mutations.setProps(props.slideId, props.rectangle.id, props.rectangle.type, { strokeWidth: value });
            }
        });
        const fillColor = computed({
            get: () => props.rectangle.fillColor,
            set: value => {
                store.mutations.setProps(props.slideId, props.rectangle.id, props.rectangle.type, { fillColor: value });
            }
        });
        const strokeColor = computed({
            get: () => props.rectangle.strokeColor,
            set: value => {
                store.mutations.setProps(props.slideId, props.rectangle.id, props.rectangle.type, { strokeColor: value });
            }
        });

        return {
            root,
            style,
            lockAspectRatio,
            x,
            y,
            width,
            height,
            rotation,
            strokeWidth,
            strokeColor,
            fillColor
        };
    }
});

export default RectangleEditorForm;
</script>
