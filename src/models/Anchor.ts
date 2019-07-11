import { CustomMouseEvent, IGraphic } from "../types";

export default class Anchor {
    public graphic: IGraphic;
    public cursor: string;
    public handler: (event: CustomMouseEvent) => void;

    constructor(graphic: IGraphic, cursor: string, handler: (event: CustomMouseEvent) => void) {
        this.graphic = graphic;
        this.cursor = cursor;
        this.handler = handler;
    }
}
