import { IGraphicMouseEvent } from "../types";

export default class GraphicMouseEvent implements IGraphicMouseEvent {
    public baseEvent: MouseEvent;
    public slideId: string;
    public graphicId: string;

    constructor(baseEvent: MouseEvent, slideId: string, graphicId: string) {
        this.baseEvent = baseEvent;
        this.slideId = slideId;
        this.graphicId = graphicId;
    }
}
