import GraphicMouseEvent from "./GraphicMouseEvent";
import CanvasMouseEvent from "./CanvasMouseEvent";
import Ellipse from "./graphics/Ellipse";

export default class Anchor {
    public graphic: Ellipse;
    public handler: (event: CustomEvent<GraphicMouseEvent | CanvasMouseEvent>) => void;

    constructor(graphic: Ellipse, handler: (event: CustomEvent<GraphicMouseEvent | CanvasMouseEvent>) => void) {
        this.graphic = graphic;
        this.handler = handler;
    }
}
