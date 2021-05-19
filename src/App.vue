<template>
<div :style='style.app'>
    <PresentationLayer v-if='showPresentation' />
    <MenuBar v-if='!showPresentation' />
    <div :style='style.interface' v-if='!showPresentation'>
        <Toolbox />
        <div :style='style.workspace'>
            <Editor />
            <Roadmap />
        </div>
        <GraphicEditor />
    </div>
</div>
</template>

<script lang='ts'>
import MenuBar from './components/MenuBar.vue';
import Toolbox from './components/Toolbox.vue';
import Editor from './components/Editor.vue';
import Roadmap from './components/Roadmap.vue';
import PresentationLayer from './components/Presentation/PresentationLayer.vue';
import GraphicEditor from './components/GraphicEditor.vue';
import { PointerTool } from './tools';
import { createStore } from './store';
import initStoreEventBus from './store/eventBus';
import { defineComponent, computed, readonly, provide } from 'vue';
import './styling/application.css';
import { useStyle } from './components/generic/core';

const App = defineComponent({
    components: {
        MenuBar,
        Toolbox,
        Editor,
        Roadmap,
        GraphicEditor,
        PresentationLayer
    },
    setup: () => {
        const { baseStyle } = useStyle();
        const style = readonly({
            app: computed(() => ({
                ...baseStyle.value.fullScreen,
                ...baseStyle.value.flexCol,
                overflow: 'none'
            })),
            interface: computed(() => ({
                flexGrow: '1',
                flexBasis: '0',
                display: 'flex',
                minHeight: '0'
            })),
            workspace: computed(() => ({
                ...baseStyle.value.flexCol,
                height: '100%',
                flexGrow: '1',
                minWidth: '0'
            }))
        });

        const store = createStore();
        store.mutations.setActiveTool(PointerTool());
        provide('store', store);
        initStoreEventBus(store);

        const showPresentation = computed(() => store.state.showPresentation);

        return {
            style,
            showPresentation
        };
    }
});

export default App;
</script>
