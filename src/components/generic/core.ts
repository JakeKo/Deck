import { getBaseStyles, themes } from '@/styling';
import { BaseStyles, Theme } from '@/styling/types';
import { onMounted, Ref, ref } from 'vue';

function useHover(): { target: Ref<Element | undefined>; isHovered: Ref<boolean> } {
    const target = ref<Element | undefined>(undefined);
    const isHovered = ref(false);

    onMounted(() => {
        if (target.value === undefined) {
            console.warn('Target ref not specified. Interaction ref "isHovered" will not update.');
            return;
        }

        target.value.addEventListener('mouseover', () => (isHovered.value = true));
        target.value.addEventListener('mouseleave', () => (isHovered.value = false));
    });

    return {
        target,
        isHovered
    };
}

function useFocus(): { target: Ref<Element | undefined>; isFocused: Ref<boolean> } {
    const target = ref<Element | undefined>(undefined);
    const isFocused = ref(false);

    onMounted(() => {
        if (target.value === undefined) {
            console.warn('Target ref not specified. Interaction ref "isFocused" will not update.');
            return;
        }

        target.value.addEventListener('focus', () => (isFocused.value = true));
        target.value.addEventListener('blur', () => (isFocused.value = false));
    });

    return {
        target,
        isFocused
    };
}

function useStyle(): { baseTheme: Ref<Theme>; baseStyle: Ref<BaseStyles> } {
    const baseTheme = ref(themes.light);
    const baseStyle = ref(getBaseStyles(baseTheme.value));

    return {
        baseTheme,
        baseStyle
    };
}

export {
    useHover,
    useFocus,
    useStyle
};
