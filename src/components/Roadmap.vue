<template>
<div ref='root' :style='style.roadmap' tabindex='0' @mousewheel='handleMouseWheel'>
    <div v-for='(slide, index) in roadmapSlides' :key='slide.id'>
        <PlaceholderRoadmapCard v-if='isReorderingSlides && placementIndex === index' />
        <StandardRoadmapCard
            v-else
            :id='slide.id'
            :isActive='slide.isActive'
            @deck-roadmap-card-mousedown='setActiveSlide'
            @deck-roadmap-card-mousedownhold='beginReorderingSlides'
            @deck-roadmap-card-mouseover='placementIndex = index'
        />
    </div>
    <AddSlideRoadmapCard />
</div>
</template>

<script lang='ts'>
import StandardRoadmapCard from './RoadmapCards/StandardRoadmapCard.vue';
import AddSlideRoadmapCard from './RoadmapCards/AddSlideRoadmapCard.vue';
import PlaceholderRoadmapCard from './RoadmapCards/PlaceholderRoadmapCard.vue';
import DeckComponent from './generic/DeckComponent';
import { defineComponent, computed, reactive, onMounted, ref } from 'vue';
import { useStyle } from './generic/core';

const Roadmap = defineComponent({
    components: {
        StandardRoadmapCard,
        AddSlideRoadmapCard,
        PlaceholderRoadmapCard
    },
    setup: () => {
        const { root, store } = DeckComponent();
        const { baseStyle, baseTheme } = useStyle();
        const style = reactive({
            roadmap: computed(() => ({
                boxSizing: 'border-box',
                borderTop: `1px solid ${baseTheme.value.color.base.flush}`,
                height: '80px',
                ...baseStyle.value.flexRow,
                flexShrink: '0',
                overflowX: 'scroll'
            }))
        });

        const roadmapSlides = computed(() => store.state.slides.map(s => ({ id: s.id, isActive: s.isActive })));
        onMounted(() => {
            if (root.value === undefined) {
                throw new Error('Root ref not specified.');
            }

            root.value.addEventListener('keydown', (event: KeyboardEvent): void => {
                if (['Backspace', 'Delete'].indexOf(event.key) !== -1 && store.state.activeSlide !== undefined) {
                    const activeSlide = store.state.activeSlide;
                    if (activeSlide !== undefined) {
                        store.mutations.removeSlide(roadmapSlides.value.findIndex(slide => slide.id === activeSlide.id));
                    }
                }
            });
        });

        function handleMouseWheel(event: WheelEvent): void {
            if (root.value === undefined) {
                throw new Error('Root ref not specified.');
            }

            if (event.deltaY === 0) {
                return;
            }

            event.preventDefault();
            root.value.scrollLeft += event.deltaY / 5;
        }

        const isReorderingSlides = ref<boolean>(false);
        const placementIndex = ref<number>(0);
        function beginReorderingSlides(): void {
            isReorderingSlides.value = true;
            document.addEventListener('mouseup', () => (isReorderingSlides.value = false), { once: true });
        }

        return {
            root,
            style,
            roadmapSlides,
            handleMouseWheel,
            placementIndex,
            setActiveSlide: store.mutations.setActiveSlide,
            beginReorderingSlides,
            isReorderingSlides
        };
    }
});

export default Roadmap;
</script>

<style scoped>
::-webkit-scrollbar {
    display: none;
}
</style>
