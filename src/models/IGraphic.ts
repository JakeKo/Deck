import * as SVG from "svg.js";
import BoundingBox from "./BoundingBox";

export default interface IGraphic {
    id: string;
    type: string;
    boundingBoxId: string;
    boundingBox: BoundingBox;
    update(properties: any): void;
    render(canvas: SVG.Doc): SVG.Element;
}
