import * as SVG from "svg.js";
import Point from "../Point";

export default interface IGraphic {
    id: string;
    type: string;
    origin: Point;
    rotation: number;
    boundingBoxId: string;
    render(canvas: SVG.Doc): SVG.Element;
    updateRendering(svg: SVG.Element): void;
}
