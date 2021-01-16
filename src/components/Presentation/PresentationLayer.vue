<template>
<div :style='style.presentationLayer'>
    <div ref='exitButtonContainer' :style='style.exitButtonContainer'>
        <button @click='hidePresentation' :style='style.exitButton' v-if='isContainerHovered'>
            <i :style='style.exitButtonIcon' class='fas fa-times' />
        </button>
    </div>
    <PresentationSlide :slide='slide' />
</div>
</template>

<script lang='ts'>
import { defineComponent, reactive, computed, onMounted, onBeforeUnmount, ref } from 'vue';
import { useHover, useStyle } from '../generic/core';
import { useStore } from '@/store';
import PresentationSlide from './PresentationSlide.vue';
import { mod } from '@/utilities/utilities';

const PresentationLayer = defineComponent({
    components: {
        PresentationSlide
    },
    setup: () => {
        const store = useStore();
        const { baseTheme, baseStyle } = useStyle();
        const { target: exitButtonContainer, isHovered: isContainerHovered } = useHover();
        const style = reactive({
            presentationLayer: computed(() => ({
                ...baseStyle.value.fullScreen,
                backgroundColor: baseTheme.value.color.basecomp.lowest,
                ...baseStyle.value.flexColCC
            })),
            exitButtonContainer: computed(() => ({
                position: 'absolute',
                top: '0',
                right: '0',
                height: '160px',
                width: '160px',
                borderRadius: '0 0 0 100%'
            })),
            exitButton: computed(() => ({
                background: baseTheme.value.color.base.highest,
                outline: 'none',
                border: 'none',
                height: '32px',
                width: '32px',
                position: 'absolute',
                top: '15%',
                right: '15%',
                cursor: 'pointer',
                ...baseStyle.value.cardHigher
            })),
            exitButtonIcon: computed(() => ({
                fontSize: baseTheme.value.text.body.size,
                color: baseTheme.value.color.basecomp.lowest,
                padding: '4px 0'
            }))
        });

        const hidePresentation = computed(() => store.mutations.setShowPresentation(false));

        function hideOnEsc(event: KeyboardEvent): void {
            if (event.key === 'Escape') {
                store.mutations.setShowPresentation(false);
            }
        };

        onMounted(() => document.addEventListener('keydown', hideOnEsc));
        onBeforeUnmount(() => document.removeEventListener('keydown', hideOnEsc));

        const activeSlideIndex = ref(0);
        const slide = computed(() => store.state.slides[activeSlideIndex.value]);
        function changeSlide(event: KeyboardEvent): void {
            if (event.code === 'ArrowLeft') {
                activeSlideIndex.value = mod(activeSlideIndex.value - 1, store.state.slides.length);
            } else if (event.code === 'ArrowRight') {
                activeSlideIndex.value = mod(activeSlideIndex.value + 1, store.state.slides.length);
            }
        }

        onMounted(() => document.addEventListener('keydown', changeSlide));
        onBeforeUnmount(() => document.removeEventListener('keydown', changeSlide));

        return {
            style,
            exitButtonContainer,
            isContainerHovered,
            hidePresentation,
            slide
        };
    }
});

export default PresentationLayer;
</script>
