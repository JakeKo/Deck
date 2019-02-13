import SlideWrapper from "../utilities/SlideWrapper";

export default class Tool {
    public name: string;
    public canvasMouseDown: (slideWrapper: SlideWrapper) => (event: CustomEvent) => void;
    public canvasMouseOver: (slideWrapper: SlideWrapper) => (event: CustomEvent) => void;
    public canvasMouseOut: (slideWrapper: SlideWrapper) => (event: CustomEvent) => void;
    public graphicMouseOver: (slideWrapper: SlideWrapper) => (event: CustomEvent) => void;
    public graphicMouseOut: (slideWrapper: SlideWrapper) => (event: CustomEvent) => void;
    public graphicMouseDown: (slideWrapper: SlideWrapper) => (event: CustomEvent) => void;

    constructor(name: string, {
        canvasMouseDown,
        canvasMouseOver,
        canvasMouseOut,
        graphicMouseOver,
        graphicMouseOut,
        graphicMouseDown
    }: {
        canvasMouseDown?: (slideWrapper: SlideWrapper) => (event: CustomEvent) => void,
        canvasMouseOver?: (slideWrapper: SlideWrapper) => (event: CustomEvent) => void,
        canvasMouseOut?: (slideWrapper: SlideWrapper) => (event: CustomEvent) => void,
        graphicMouseOver?: (slideWrapper: SlideWrapper) => (event: CustomEvent) => void,
        graphicMouseOut?: (slideWrapper: SlideWrapper) => (event: CustomEvent) => void,
        graphicMouseDown?: (slideWrapper: SlideWrapper) => (event: CustomEvent) => void
    }) {
        const EMPTY_HANDLER: () => () => void = (): () => void => (): void => { return; };

        this.name = name;
        this.canvasMouseDown = canvasMouseDown || EMPTY_HANDLER;
        this.canvasMouseOver = canvasMouseOver || EMPTY_HANDLER;
        this.canvasMouseOut = canvasMouseOut || EMPTY_HANDLER;
        this.graphicMouseOver = graphicMouseOver || EMPTY_HANDLER;
        this.graphicMouseOut = graphicMouseOut ||EMPTY_HANDLER;
        this.graphicMouseDown = graphicMouseDown || EMPTY_HANDLER;
    }
}
