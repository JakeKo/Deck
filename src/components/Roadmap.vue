<template>
<div ref='root' :style='style.roadmap' tabindex='0' @mousewheel.passive='handleMouseWheel'>
    <div v-for='(slide, index) in roadmapSlides' :key='slide.id' :ref='refRoadmapCard'>
        <StandardRoadmapCard
            :id='slide.id'
            :isActive='slide.isActive'
            @deck-roadmap-card-mousedown='setActiveSlide'
            @deck-roadmap-card-mousedownhold='beginReorderingSlides(index)'
        />
    </div>
    <AddSlideRoadmapCard />
</div>
</template>

<script lang='ts'>
import StandardRoadmapCard from './RoadmapCards/StandardRoadmapCard.vue';
import AddSlideRoadmapCard from './RoadmapCards/AddSlideRoadmapCard.vue';
import DeckComponent from './generic/DeckComponent';
import { defineComponent, computed, reactive, onMounted, ref, onBeforeUpdate } from 'vue';
import { useStyle } from './generic/core';

const Roadmap = defineComponent({
    components: {
        StandardRoadmapCard,
        AddSlideRoadmapCard
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

        const roadmapCards = ref<HTMLElement[]>([]);
        onBeforeUpdate(() => (roadmapCards.value = []));
        function refRoadmapCard(element: HTMLElement): void {
            roadmapCards.value.push(element);
        }

        function beginReorderingSlides(index: number): void {
            const sourceIndex = index;
            let targetIndex = index;

            // Calculate the centers of each roadmap card so we may determine when the user is hovering over each
            const borders: number[] = roadmapCards.value
                .map(element => element.getBoundingClientRect())
                .map(box => box.x + box.width / 2);

            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', end, { once: true });

            function move(event: MouseEvent): void {
                event.preventDefault();

                // Calculate newTargetIndex by determining the center the user is closest to
                // This essentially detects when a user is hovering over a roadmap card
                const diffs = borders.map(border => Math.abs(border - event.clientX));
                const minDiff = Math.min(...diffs);
                const newTargetIndex = diffs.indexOf(minDiff);

                // Don't bother moving slides if the user isn't hovering over a new roadmap card
                if (newTargetIndex === targetIndex) {
                    return;
                }

                // Undo previous move, then move the slide to the new location
                store.mutations.moveSlide(targetIndex, sourceIndex);
                targetIndex = newTargetIndex;
                store.mutations.moveSlide(sourceIndex, targetIndex);
            }

            function end(): void {
                document.removeEventListener('mousemove', move);
            }
        }

        return {
            root,
            style,
            roadmapSlides,
            handleMouseWheel,
            setActiveSlide: store.mutations.setActiveSlide,
            beginReorderingSlides,
            refRoadmapCard
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
