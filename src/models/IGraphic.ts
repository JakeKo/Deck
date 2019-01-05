import * as SVG from "svg.js";
import Rectangle from "./Rectangle";

export default interface IGraphic {
    id: string;
    getBoundingBox(): Rectangle;
    render(canvas: SVG.Doc): SVG.Element;
}
