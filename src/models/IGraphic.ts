import * as SVG from "svg.js";
import BoundingBox from "./BoundingBox";
import Point from "./Point";

export default interface IGraphic {
    id: string;
    type: string;
    origin: Point;
    boundingBoxId: string;
    boundingBox: BoundingBox;
    update(properties: any): void;
    render(canvas: SVG.Doc): SVG.Element;
}
