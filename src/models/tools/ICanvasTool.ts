import SlideWrapper from "../../utilities/SlideWrapper";
import CanvasMouseEvent from "../CanvasMouseEvent";
import GraphicMouseEvent from "../GraphicMouseEvent";

export default interface ICanvasTool {
    canvasMouseDown(slideWrapper: SlideWrapper): (event: CustomEvent<CanvasMouseEvent>) => void;
    canvasMouseOver(slideWrapper: SlideWrapper): (event: CustomEvent<CanvasMouseEvent>) => void;
    canvasMouseOut(slideWrapper: SlideWrapper): (event: CustomEvent<CanvasMouseEvent>) => void;
    graphicMouseOver(slideWrapper: SlideWrapper): (event: CustomEvent<GraphicMouseEvent>) => void;
    graphicMouseOut(slideWrapper: SlideWrapper): (event: CustomEvent<GraphicMouseEvent>) => void;
    graphicMouseDown(slideWrapper: SlideWrapper): (event: CustomEvent<GraphicMouseEvent>) => void;
}
