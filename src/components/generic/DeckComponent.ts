import { getBaseStyles, themes } from '@/styling';
import { onMounted, ref } from 'vue';
import { useStore } from '@/store';

function DeckComponent() {
    const root = ref<HTMLElement | undefined>(undefined);
    const baseTheme = ref(themes.light);
    const baseStyle = ref(getBaseStyles(baseTheme.value));
    const isHovered = ref(false);
    const isFocused = ref(false);
    const store = useStore();

    onMounted(() => {
        if (root.value === undefined) {
            console.warn('Root ref not specified. Interaction setters like isHovered and isFocused will not update.');
            return;
        }

        root.value.addEventListener('mouseover', () => { isHovered.value = true; });
        root.value.addEventListener('mouseleave', () => { isHovered.value = false; });
        root.value.addEventListener('focus', () => { isFocused.value = true; });
        root.value.addEventListener('blur', () => { isFocused.value = false; });
    });

    return {
        root,
        baseTheme,
        baseStyle,
        isHovered,
        isFocused,
        store
    };
}

export default DeckComponent;
