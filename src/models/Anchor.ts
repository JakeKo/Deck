import GraphicMouseEvent from "./GraphicMouseEvent";
import CanvasMouseEvent from "./CanvasMouseEvent";
import Ellipse from "./graphics/Ellipse";

export default class Anchor {
    public graphic: Ellipse;
    public cursor: string;
    public handler: (event: CustomEvent<GraphicMouseEvent | CanvasMouseEvent>) => void;

    constructor(graphic: Ellipse, cursor: string, handler: (event: CustomEvent<GraphicMouseEvent | CanvasMouseEvent>) => void) {
        this.graphic = graphic;
        this.cursor = cursor;
        this.handler = handler;
    }
}
