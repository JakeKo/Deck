import GraphicMouseEvent from "./GraphicMouseEvent";
import Ellipse from "./graphics/Ellipse";

export default class Anchor {
    public graphic: Ellipse;
    public handler: (event: CustomEvent<GraphicMouseEvent>) => void;

    constructor(graphic: Ellipse, handler: (event: CustomEvent<GraphicMouseEvent>) => void) {
        this.graphic = graphic;
        this.handler = handler;
    }
}
