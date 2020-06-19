<template>
<div id='app'>
    <menu-bar />
    <div id='interface'>
        <toolbox />
        <div id='workspace'>
            <editor></editor>
            <roadmap></roadmap>
        </div>
        <!-- <graphic-editor></graphic-editor> -->
    </div>
</div>
</template>

<script lang='ts'>
import { Vue, Component } from 'vue-property-decorator';
import MenuBar from './components/MenuBar.vue';
import Toolbox from './components/Toolbox.vue';
import Editor from './components/Editor.vue';
import Roadmap from './components/Roadmap.vue';
import pointerTool from './tools/PointerTool';
import { MUTATIONS } from './store/types';
// import GraphicEditor from './components/GraphicEditor.vue';
// import Utilities from './utilities';
// import { IGraphic } from './types';

@Component({
    components: {
        MenuBar,
        Toolbox,
        Editor,
        Roadmap,
        // GraphicEditor
    }
})
export default class App extends Vue {
    // Initialize application settings
    private mounted(): void {
        this.$store.commit(MUTATIONS.ACTIVE_TOOL, pointerTool(this.$store));
    }
}
</script>

<style lang='scss'>
@import './styles/application';

#app {
    height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: column;
    overflow: none;
}

#interface {
    flex-grow: 1;
    flex-basis: 0;
    display: flex;
    min-height: 0;
}

#workspace {
    display: flex;
    flex-direction: column;
    height: 100%;
    flex-grow: 1;
    min-width: 0; // Override min-width default for flex items
}
</style>
