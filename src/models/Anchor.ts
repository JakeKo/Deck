import { Ellipse } from "./graphics/graphics";
import { CustomMouseEvent } from "../types";

export default class Anchor {
    public graphic: Ellipse;
    public cursor: string;
    public handler: (event: CustomMouseEvent) => void;

    constructor(graphic: Ellipse, cursor: string, handler: (event: CustomMouseEvent) => void) {
        this.graphic = graphic;
        this.cursor = cursor;
        this.handler = handler;
    }
}
