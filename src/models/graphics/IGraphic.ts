import * as SVG from "svg.js";
import Vector from "../Vector";
import SnapVector from "../SnapVector";

export default interface IGraphic {
    id: string;
    type: string;
    origin: Vector;
    rotation: number;
    boundingBoxId: string;
    render(canvas: SVG.Doc): SVG.Element;
    updateRendering(svg: SVG.Element): void;
    getSnapVectors(origin: Vector): Array<SnapVector>;
    getSnappableVectors(origin: Vector): Array<Vector>;
}
