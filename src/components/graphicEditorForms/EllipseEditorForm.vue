<template>
    <div ref='root' :style='style.ellipseEditorForm'>
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
import { EllipseStoreModel } from '@/store/types';
import V from '@/utilities/Vector';
import { computed, defineComponent, PropType, reactive, ref } from 'vue';
import DeckComponent from '../generic/DeckComponent';
import NumberField from '../generic/NumberField.vue';
import ColorField from '../generic/ColorField.vue';
import ToggleField from '../generic/ToggleField.vue';
import { degToRad, radToDeg } from '@/utilities/utilities';
import { correctForRotationWhenChangingDimensions } from './utilities';

const EllipseEditorForm = defineComponent({
    components: {
        NumberField,
        ColorField,
        ToggleField
    },
    props: {
        ellipse: { type: Object as PropType<EllipseStoreModel>, required: true },
        slideId: { type: String, required: true }
    },
    setup: props => {
        const { root, store, baseStyle } = DeckComponent();
        const style = reactive({
            ellipseEditorForm: computed(() => ({
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
            get: () => props.ellipse.center.x,
            set: value => {
                store.mutations.setGraphic(props.slideId, { ...props.ellipse, center: new V(value, props.ellipse.center.y) });
                store.mutations.broadcastSetX(props.slideId, props.ellipse.id, value);
            }
        });
        const y = computed({
            get: () => props.ellipse.center.y,
            set: value => {
                store.mutations.setGraphic(props.slideId, { ...props.ellipse, center: new V(props.ellipse.center.x, value) });
                store.mutations.broadcastSetY(props.slideId, props.ellipse.id, value);
            }
        });
        const width = computed({
            get: () => props.ellipse.width,
            set: value => {
                const height = lockAspectRatio.value
                    ? value * props.ellipse.height / props.ellipse.width
                    : props.ellipse.height;
                const initialDimensions = new V(props.ellipse.width, props.ellipse.height);
                const newDimensions = new V(value, height);

                // Unlike other rectangular graphics, the ellipse uses the center as the base point
                // We have to do some extra vector math to get the center to move but the top-left "origin" to stay in place
                const newOrigin = correctForRotationWhenChangingDimensions({
                    basePoint: props.ellipse.center.add(initialDimensions.scale(-0.5)),
                    initialDimensions,
                    newDimensions,
                    rotation: props.ellipse.rotation
                });
                const newCenter = newOrigin.add(newDimensions.scale(0.5));

                store.mutations.setGraphic(props.slideId, { ...props.ellipse, width: value, height, center: newCenter });
                store.mutations.broadcastSetWidth(props.slideId, props.ellipse.id, value);
                store.mutations.broadcastSetHeight(props.slideId, props.ellipse.id, height);
                store.mutations.broadcastSetX(props.slideId, props.ellipse.id, newCenter.x);
                store.mutations.broadcastSetY(props.slideId, props.ellipse.id, newCenter.y);
            }
        });
        const height = computed({
            get: () => props.ellipse.height,
            set: value => {
                const width = lockAspectRatio.value
                    ? value * props.ellipse.width / props.ellipse.height
                    : props.ellipse.width;
                const initialDimensions = new V(props.ellipse.width, props.ellipse.height);
                const newDimensions = new V(width, value);

                // Unlike other rectangular graphics, the ellipse uses the center as the base point
                // We have to do some extra vector math to get the center to move but the top-left "origin" to stay in place
                const newOrigin = correctForRotationWhenChangingDimensions({
                    basePoint: props.ellipse.center.add(initialDimensions.scale(-0.5)),
                    initialDimensions,
                    newDimensions,
                    rotation: props.ellipse.rotation
                });
                const newCenter = newOrigin.add(newDimensions.scale(0.5));

                store.mutations.setGraphic(props.slideId, { ...props.ellipse, width, height: value, center: newCenter });
                store.mutations.broadcastSetWidth(props.slideId, props.ellipse.id, width);
                store.mutations.broadcastSetHeight(props.slideId, props.ellipse.id, value);
                store.mutations.broadcastSetX(props.slideId, props.ellipse.id, newCenter.x);
                store.mutations.broadcastSetY(props.slideId, props.ellipse.id, newCenter.y);
            }
        });
        const rotation = computed({
            get: () => radToDeg(props.ellipse.rotation),
            set: value => {
                store.mutations.setGraphic(props.slideId, { ...props.ellipse, rotation: degToRad(value) });
                store.mutations.broadcastSetRotation(props.slideId, props.ellipse.id, degToRad(value));
            }
        });
        const strokeWidth = computed({
            get: () => props.ellipse.strokeWidth,
            set: value => {
                store.mutations.setGraphic(props.slideId, { ...props.ellipse, strokeWidth: value });
                store.mutations.broadcastSetStrokeWidth(props.slideId, props.ellipse.id, value);
            }
        });
        const fillColor = computed({
            get: () => props.ellipse.fillColor,
            set: value => {
                store.mutations.setGraphic(props.slideId, { ...props.ellipse, fillColor: value });
                store.mutations.broadcastSetFillColor(props.slideId, props.ellipse.id, value);
            }
        });
        const strokeColor = computed({
            get: () => props.ellipse.strokeColor,
            set: value => {
                store.mutations.setGraphic(props.slideId, { ...props.ellipse, strokeColor: value });
                store.mutations.broadcastSetStrokeColor(props.slideId, props.ellipse.id, value);
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

export default EllipseEditorForm;
</script>
