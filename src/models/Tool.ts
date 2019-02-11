import * as SVG from "svg.js";
import IGraphic from "./IGraphic";
import SlideWrapper from "../utilities/SlideWrapper";

export default class Tool {
    public name: string;
    public canvasMouseDown: (slideWrapper: SlideWrapper) => (event: CustomEvent) => void;
    public canvasMouseOver: (slideWrapper: SlideWrapper) => (event: CustomEvent) => void;
    public canvasMouseOut: (slideWrapper: SlideWrapper) => (event: CustomEvent) => void;
    public graphicMouseOver: (svg: SVG.Element) => (event: MouseEvent) => any;
    public graphicMouseOut: (svg: SVG.Element) => (event: MouseEvent) => any;
    public graphicMouseDown: (slide: any, svg: SVG.Element, graphic: IGraphic) => (event: MouseEvent) => any;

    constructor(name: string, {
        canvasMouseDown,
        canvasMouseOver,
        canvasMouseOut,
        graphicMouseOver,
        graphicMouseOut,
        graphicMouseDown
    }: {
        canvasMouseDown?: (slideWrapper: SlideWrapper) => (event: CustomEvent) => void;
        canvasMouseOver?: (slideWrapper: SlideWrapper) => (event: CustomEvent) => void;
        canvasMouseOut?: (slideWrapper: SlideWrapper) => (event: CustomEvent) => void;
        graphicMouseOver?: (svg: SVG.Element) => (event: MouseEvent) => any;
        graphicMouseOut?: (svg: SVG.Element) => (event: MouseEvent) => any;
        graphicMouseDown?: (slide: any, svg: SVG.Element, graphic: IGraphic) => (event: MouseEvent) => any;
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
