import { Vue, Component } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import { GETTERS } from '../../store/types';
import { BaseStyles, StyleCreator } from '../../styling/types';

@Component
class DeckComponent<T, U> extends Vue {
    constructor(props: any) {
        super(props);
    }

    @Getter public [GETTERS.STYLE]: (props: T, customStyles: StyleCreator<T, U>) => BaseStyles & U;

    public isHovered: boolean = false;

    public mounted(): void {
        this.$el.addEventListener('mouseover', () => this.isHovered = true);
        this.$el.addEventListener('mouseleave', () => this.isHovered = false);
    }
}

export default DeckComponent;
