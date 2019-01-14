import * as SVG from "svg.js";
import BoundingBox from "./BoundingBox";

export default interface IGraphic {
    id: string;
    boundingBoxId: string;
    boundingBox: BoundingBox;
    render(canvas: SVG.Doc): SVG.Element;
}
