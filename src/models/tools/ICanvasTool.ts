import SlideWrapper from "../../utilities/SlideWrapper";

export default interface ICanvasTool {
    canvasMouseDown(slideWrapper: SlideWrapper): (event: CustomEvent) => void;
    canvasMouseOver(slideWrapper: SlideWrapper): (event: CustomEvent) => void;
    canvasMouseOut(slideWrapper: SlideWrapper): (event: CustomEvent) => void;
    graphicMouseOver(slideWrapper: SlideWrapper): (event: CustomEvent) => void;
    graphicMouseOut(slideWrapper: SlideWrapper): (event: CustomEvent) => void;
    graphicMouseDown(slideWrapper: SlideWrapper): (event: CustomEvent) => void;
}
