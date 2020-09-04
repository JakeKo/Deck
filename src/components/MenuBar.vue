<template>
<div ref='root' :style="style.menuBar">
    <button :style='style.importButton' @click='importSlideDeck'>Import</button>
    <button :style='style.exportButton' @click='exportSlideDeck'>Export</button>
    <TitleField />
</div>
</template>

<script lang='ts'>
import DeckComponent from './generic/DeckComponent';
import TitleField from './TitleField.vue';
import { defineComponent, computed, reactive } from 'vue';
import { jsonToSlides } from '@/utilities/parsing/storeModel';
import SlideStateManager from '@/utilities/SlideStateManager';

const MenuBar = defineComponent({
    components: {
        TitleField
    },
    setup: () => {
        const { root, store, baseStyle, baseTheme } = DeckComponent();
        const style = reactive({
            menuBar: computed(() => ({
                height: '28px',
                flexShrink: '0',
                boxSizing: 'border-box',
                borderBottom: `1px solid ${baseTheme.value.color.base.flush}`,
                background: baseTheme.value.color.base.highest,
                ...baseStyle.value.fontBody,
                ...baseStyle.value.flexRowCC
            })),
            importButton: computed(() => ({
                height: '100%',
                border: 'none',
                outline: 'none',
                background: baseTheme.value.color.base.highest,
                cursor: 'pointer',
                ...baseStyle.value.fontBody
            })),
            exportButton: computed(() => ({
                height: '100%',
                border: 'none',
                outline: 'none',
                background: baseTheme.value.color.base.highest,
                cursor: 'pointer',
                ...baseStyle.value.fontBody
            }))
        });

        async function exportSlideDeck(): Promise<void> {
            const json = JSON.stringify(store.slides.value.map(s => ({
                id: s.id,
                graphics: s.graphics
            })));

            const encodedJson = `data:text/json;charset=utf-8,${encodeURIComponent(json)}`;
            const anchor = document.createElement('a');
            anchor.setAttribute('href', encodedJson);
            anchor.setAttribute('download', `${store.deckTitle.value ?? 'Untitled'}.json`);
            anchor.click();
            anchor.remove();
        }

        async function importSlideDeck(): Promise<void> {
            const reader = new FileReader();
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';

            input.addEventListener('input', (): void => reader.readAsText(input.files ? input.files[0] : new Blob()));
            reader.addEventListener('loadend', (): void => {
                const slides = jsonToSlides(reader.result as string);
                console.log(slides);

                store.removeAllSlides();

                setTimeout(() => {
                    slides.forEach((slide, index) => {
                        store.addSlide(index, {
                            id: slide.id,
                            isActive: false,
                            graphics: slide.graphics,
                            stateManager: new SlideStateManager(slide.id)
                        });
                    });

                    if (slides.length > 0) {
                        store.setActiveSlide(slides[0].id);
                    }
                }, 250);
            });

            input.click();
        }

        return {
            root,
            style,
            exportSlideDeck,
            importSlideDeck
        };
    }
});

export default MenuBar;
</script>
