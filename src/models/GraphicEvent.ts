import { IGraphic } from "../types";

export default class GraphicEvent {
    public slideId: string;
    public graphicId?: string;
    public graphic?: IGraphic;

    constructor(slideId: string, graphicId: string, graphic: IGraphic) {
        this.slideId = slideId;
        this.graphicId = graphicId;
        this.graphic = graphic;
    }
}
