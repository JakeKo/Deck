<template>
<div ref='root' :style="style.roadmap" tabindex="0" @mousewheel='handleMouseWheel'>
    <RoadmapCard v-for='slide in roadmapSlides'
        :key='slide.id'
        :id='slide.id'
        :isActive='slide.isActive'
        :isAddSlideCard='false'
    />
    <RoadmapCard :id='"0"' :isActive='false' :isAddSlideCard='true' />
</div>
</template>

<script lang='ts'>
import RoadmapCard from './RoadmapCard.vue';
import DeckComponent from './generic/DeckComponent';
import { defineComponent, computed, reactive, onMounted } from 'vue';

const Roadmap = defineComponent({
    components: {
        RoadmapCard
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
