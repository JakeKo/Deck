import * as SVG from "svg.js";

export default class ToolModel {
    public name: string;
    public graphicHandlers: (canvas: SVG.Doc, svg: SVG.Element) => any;

    constructor(name: string, graphicHandlers: (canvas: SVG.Doc, svg: SVG.Element) => any) {
        this.name = name;
        this.graphicHandlers = graphicHandlers;
    }
}
