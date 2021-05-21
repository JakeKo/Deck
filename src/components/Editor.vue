<template>
<div ref='root' :style="style.editor" @mousewheel='handleMouseWheel'>
    <SlidePlaceholder v-if='slides.length === 0' />
    <Slide v-for='slide in slides'
        :key='slide.id'
        :slide='slide'
    />
</div>
</template>

<script lang='ts'>
import Slide from './Slide.vue';
import SlidePlaceholder from './SlidePlaceholder.vue';
import DeckComponent from './generic/DeckComponent';
import { dispatch } from '@/events';
import { SlideZoomEventPayload, SLIDE_EVENTS } from '@/events/types';
import { defineComponent, computed, reactive, onMounted, watchEffect } from 'vue';

const Editor = defineComponent({
    components: {
        Slide,
        SlidePlaceholder
    },
    setup: () => {
        const { root, store, baseTheme } = DeckComponent();
        const style = reactive({
            editor: computed(() => ({
                display: 'flex',
                flexGrow: '1',
                overflow: 'scroll',
                background: baseTheme.value.color.base.flush,
                zoom: store.state.editorViewbox.zoom.toString()
            }))
        });
        const defaultZoom = computed(() => {
            if (root.value === undefined) {
                throw new Error('Root ref not specified.');
            }

            const editorWidth = root.value.offsetWidth;
            const editorHeight = root.value.offsetHeight;
            const slideWidth = store.state.editorViewbox.cropped.width + 100;
            const slideHeight = store.state.editorViewbox.cropped.height + 100;
            return Math.min(editorWidth / slideWidth, editorHeight / slideHeight);
        });
        const slides = computed(() => store.state.slides);

        // Set the zoom level, then center the view on the slide
        async function reorientSlide(): Promise<void> {
            // For some reason, when returning from presentation view, root here is not quite defined in time
            // Spotty fix: just wait a wee bit
            if (root.value === undefined) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            if (root.value === undefined) {
                throw new Error('Root ref not specified.');
            }

            // Note: Editor zoom must be set manually to avoid scrolling before zooming
            root.value.style.zoom = defaultZoom.value.toString();
            root.value.scrollTop = (root.value.scrollHeight - root.value.clientHeight) / 2;
            root.value.scrollLeft = (root.value.scrollWidth - root.value.clientWidth) / 2;

            store.mutations.setEditorZoom(defaultZoom.value);
            dispatch<SlideZoomEventPayload>(SLIDE_EVENTS.ZOOM, { zoom: defaultZoom.value });
        }

        function handleMouseWheel(event: WheelEvent): void {
            if (!event.ctrlKey) {
                return;
            }

            if (root.value === undefined) {
                throw new Error('Root ref not specified.');
            }

            event.preventDefault();
            const deltaZoom = event.deltaY < 0 ? 0.1 : -0.1;
            const newZoom = store.state.editorViewbox.zoom + deltaZoom;

            store.mutations.setEditorZoom(newZoom);
            dispatch<SlideZoomEventPayload>(SLIDE_EVENTS.ZOOM, { zoom: newZoom });
        }

        onMounted(reorientSlide);
        watchEffect(() => {
            if (store.state.activeSlide !== undefined) {
                reorientSlide();
            }
        });

        return {
            root,
            style,
            handleMouseWheel,
            slides
        };
    }
});

export default Editor;
</script>
