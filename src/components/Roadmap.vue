<template>
<div ref='root' :style="style.roadmap" tabindex="0">
    <RoadmapSlot v-for='slide in roadmapSlides'
        :key='slide.id'
        :id='slide.id'
        :isActive='slide.isActive'
    />
    <div :style="style.addSlideSlot" @click='createNewSlide'>
        <div :style="style.addSlideLabel">Add Slide</div>
        <div :style="style.addSlideButton">
            <i class='fas fa-plus' />
        </div>
    </div>
</div>
</template>

<script lang='ts'>
import RoadmapSlot from './RoadmapSlot.vue';
import DeckComponent from './generic/DeckComponent';
import { defineComponent, computed, reactive, onMounted } from 'vue';

const Roadmap = defineComponent({
    components: {
        RoadmapSlot
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
            })),
            addSlideSlot: computed(() => ({
                height: '100%',
                padding: '8px',
                boxSizing: 'border-box',
                ...baseStyle.value.flexColCC,
                justifyContent: 'space-between',
                cursor: 'pointer'
            })),
            addSlideLabel: computed(() => ({
                ...baseStyle.value.fontBody
            })),
            addSlideButton: computed(() => ({
                height: '45px',
                width: '80px',
                ...baseStyle.value.flexRowCC,
                color: baseTheme.value.color.base.highest,
                background: baseTheme.value.color.primary.flush
            }))
        });
        const roadmapSlides = computed(() => store.state.slides.map(s => ({ id: s.id, isActive: s.isActive })));

        function createNewSlide(): void {
            store.mutations.addSlide(store.state.slides.length);

            const lastSlide = store.state.slides[store.state.slides.length - 1];
            if (lastSlide === undefined) {
                throw new Error('Failed to create new slide');
            }

            store.mutations.setActiveSlide(lastSlide.id);
        }

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

        return {
            root,
            style,
            createNewSlide,
            roadmapSlides
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
