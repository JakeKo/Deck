export default class CanvasMouseEvent extends Event {
    public baseEvent: MouseEvent;
    public slideId: string;

    constructor(baseEvent: MouseEvent, slideId: string) {
        super("CanvasMouseEvent");
        this.baseEvent = baseEvent;
        this.slideId = slideId;
    }
}
