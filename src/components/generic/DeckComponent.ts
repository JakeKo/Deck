import { Component, Vue } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import { GETTERS } from '../../store/types';
import { BaseStyles, StyleCreator } from '../../styling/types';

@Component
class DeckComponent<T, U> extends Vue {
    @Getter public [GETTERS.STYLE]: (props: T, customStyles: StyleCreator<T, U>) => BaseStyles & U;
    public isHovered: boolean = false;
    public isFocused: boolean = false;

    public mounted(): void {
        this.bindEvents();
    }

    // TODO: Investigate ways for events to be automatically bound on all components
    public bindEvents(): void {
        this.$el.addEventListener('mouseover', () => this.isHovered = true);
        this.$el.addEventListener('mouseleave', () => this.isHovered = false);
        this.$el.addEventListener('focus', () => this.isFocused = true);
        this.$el.addEventListener('blur', () => this.isFocused = false);
    }
}

export default DeckComponent;
