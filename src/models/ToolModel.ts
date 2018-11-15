import * as SVG from "svg.js";
import GraphicModel from "./GraphicModel";

export default class ToolModel {
    public name: string;
    public canvasMouseDown?: (canvas: SVG.Doc) => (event: MouseEvent) => any;
    public graphicMouseOver?: (svg: SVG.Element) => (event: MouseEvent) => any;
    public graphicMouseOut?: (svg: SVG.Element) => (event: MouseEvent) => any;
    public graphicMouseDown?: (slide: any, svg: SVG.Element, graphic: GraphicModel) => (event: MouseEvent) => any;

    constructor(name: string, { canvasMouseDown, graphicMouseOver, graphicMouseOut, graphicMouseDown }:
        {
            canvasMouseDown?: (canvas: SVG.Doc) => (event: MouseEvent) => any;
            graphicMouseOver?: (svg: SVG.Element) => (event: MouseEvent) => any;
            graphicMouseOut?: (svg: SVG.Element) => (event: MouseEvent) => any;
            graphicMouseDown?: (slide: any, svg: SVG.Element, graphic: GraphicModel) => (event: MouseEvent) => any;
        }
    ) {
        this.name = name;
        this.canvasMouseDown = canvasMouseDown;
        this.graphicMouseOver = graphicMouseOver;
        this.graphicMouseOut = graphicMouseOut;
        this.graphicMouseDown = graphicMouseDown;
    }
}
