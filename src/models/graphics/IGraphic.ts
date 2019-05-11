import * as SVG from "svg.js";
import Vector from "../Vector";
import SnapVector from "../SnapVector";
import SlideWrapper from "../../utilities/SlideWrapper";
import Anchor from "../Anchor";

export default interface IGraphic {
    id: string;
    type: string;
    origin: Vector;
    rotation: number;
    boundingBoxId: string;
    defaultInteractive: boolean;
    render(canvas: SVG.Doc): SVG.Element;
    updateRendering(svg: SVG.Element): void;
    getSnapVectors(): Array<SnapVector>;
    getSnappableVectors(): Array<Vector>;
    getAnchors(slideWrapper: SlideWrapper): Array<Anchor>;
}
