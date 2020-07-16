<template>
<div :style="appStyle">
    <menu-bar />
    <div :style="interfaceStyle">
        <toolbox />
        <div :style="workspaceStyle">
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
import { MUTATIONS, GETTERS } from './store/types';
import { mapMutations } from 'vuex';
import { EditorTool } from './tools/types';
import { Mutation } from 'vuex-class';
import { StyleCreator } from './styling/types';
import DeckComponent from './components/generic/DeckComponent';

type StyleProps = {};
type Style = {
    app: any;
    interface: any;
    workspace: any;
};
const componentStyle: StyleCreator<StyleProps, Style> = ({ theme, base, props }) => ({
    app: {
        ...base.fullScreen,
        ...base.flexCol,
        overflow: 'none'
    },
    interface: {
        flexGrow: '1',
        flexBasis: '0',
        display: 'flex',
        minHeight: '0'
    },
    workspace: {
        ...base.flexCol,
        height: '100%',
        flexGrow: '1',
        minWidth: '0'
    }
});

@Component({
    components: {
        MenuBar,
        Toolbox,
        Editor,
        Roadmap
    }
})
export default class App extends DeckComponent<StyleProps, Style> {
    @Mutation private [MUTATIONS.ACTIVE_TOOL]: (tool: EditorTool) => void;

    // Initialize application settings
    public mounted(): void {
        this.bindEvents();
        this[MUTATIONS.ACTIVE_TOOL](PointerTool(this.$store));
    }

    private get appStyle(): any {
        const style = this[GETTERS.STYLE]({}, componentStyle);
        return style.app;
    }

    private get interfaceStyle(): any {
        const style = this[GETTERS.STYLE]({}, componentStyle);
        return style.interface;
    }

    private get workspaceStyle(): any {
        const style = this[GETTERS.STYLE]({}, componentStyle);
        return style.workspace;
    }
}
</script>

<style lang='scss'>
@import './styles/application';
</style>
