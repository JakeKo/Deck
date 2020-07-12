<template>
<div id='app'>
    <menu-bar />
    <div id='interface'>
        <toolbox />
        <div id='workspace'>
            <editor></editor>
            <roadmap></roadmap>
        </div>
    </div>
</div>
</template>

<script lang='ts'>
import { Vue, Component } from 'vue-property-decorator';
import MenuBar from './components/MenuBar.vue';
import Toolbox from './components/Toolbox.vue';
import Editor from './components/Editor.vue';
import Roadmap from './components/Roadmap.vue';
import { PointerTool } from './tools';
import { MUTATIONS } from './store/types';
import { mapMutations } from 'vuex';
import { EditorTool } from './tools/types';
import { Mutation } from 'vuex-class';

@Component({
    components: {
        MenuBar,
        Toolbox,
        Editor,
        Roadmap
    }
})
export default class App extends Vue {
    @Mutation private [MUTATIONS.ACTIVE_TOOL]: (tool: EditorTool) => void;

    // Initialize application settings
    private mounted(): void {
        this[MUTATIONS.ACTIVE_TOOL](PointerTool(this.$store));
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
