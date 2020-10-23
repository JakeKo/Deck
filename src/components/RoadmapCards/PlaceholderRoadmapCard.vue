<template>
    <div :style='style.placeholderRoadmapCard' />
</template>

<script lang='ts'>
import { defineComponent, computed, reactive } from 'vue';
import { useStyle } from '../generic/core';

const PlaceholderRoadmapCard = defineComponent({
    setup: () => {
        const { baseTheme } = useStyle();
        const style = reactive({
            placeholderRoadmapCard: computed(() => ({
                height: '100%',
                width: '96px',
                background: baseTheme.value.color.base.flush
            }))
        });

        return {
            style
        };
    }
});

export default PlaceholderRoadmapCard;
</script>
