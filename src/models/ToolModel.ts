import * as SVG from "svg.js";
import GrahpicModel from "./GraphicModel";

export default class ToolModel {
    public name: string;
    public graphicHandlers: (canvas: SVG.Doc, store: any, svg: SVG.Element, graphic: GrahpicModel) => any;

    constructor(name: string, graphicHandlers: (canvas: SVG.Doc, store: any, svg: SVG.Element, graphic: GrahpicModel) => any) {
        this.name = name;
        this.graphicHandlers = graphicHandlers;
    }
}
