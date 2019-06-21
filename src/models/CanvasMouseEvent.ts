import { ICanvasMouseEvent } from "../types";

export default class CanvasMouseEvent implements ICanvasMouseEvent {
    public baseEvent: MouseEvent;
    public slideId: string;

    constructor(baseEvent: MouseEvent, slideId: string) {
        this.baseEvent = baseEvent;
        this.slideId = slideId;
    }
}
