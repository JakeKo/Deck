<template>
<div ref='root' :style='style.app'>
    <MenuBar />
    <div :style='style.interface'>
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
import GraphicEditor from './components/GraphicEditor.vue';
import { PointerTool } from './tools';
import DeckComponent from './components/generic/DeckComponent';
import { provideStore } from './store';
import { defineComponent, computed, readonly } from 'vue';
import './styling/application.css';

const App = defineComponent({
    components: {
        MenuBar,
        Toolbox,
        Editor,
        Roadmap,
        GraphicEditor
    },
    setup: () => {
        provideStore();
        const { root, store, baseStyle } = DeckComponent();

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

        store.mutations.setActiveTool(PointerTool());

        return {
            root,
            style
        };
    }
});

export default App;
</script>
