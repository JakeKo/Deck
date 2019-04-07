export default class GraphicMouseEvent {
    public baseEvent: MouseEvent;
    public slideId: string;
    public graphicId: string;

    constructor(baseEvent: MouseEvent, slideId: string, graphicId: string) {
        this.baseEvent = baseEvent;
        this.slideId = slideId;
        this.graphicId = graphicId;
    }
}
