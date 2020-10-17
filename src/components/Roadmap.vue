<template>
<div ref='root' :style="style.roadmap" tabindex="0" @mousewheel='handleMouseWheel'>
    <component v-for='slide in roadmapSlides'
        :is='"StandardRoadmapCard"'
        :key='slide.id'
        :id='slide.id'
        :isActive='slide.isActive'
    />
    <AddSlideRoadmapCard />
</div>
</template>

<script lang='ts'>
import StandardRoadmapCard from './RoadmapCards/StandardRoadmapCard.vue';
import AddSlideRoadmapCard from './RoadmapCards/AddSlideRoadmapCard.vue';
import DeckComponent from './generic/DeckComponent';
import { defineComponent, computed, reactive, onMounted } from 'vue';

const Roadmap = defineComponent({
    components: {
        StandardRoadmapCard,
        AddSlideRoadmapCard
    },
    setup: () => {
        const { root, store, baseStyle, baseTheme } = DeckComponent();
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

        return {
            root,
            style,
            roadmapSlides,
            handleMouseWheel
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
