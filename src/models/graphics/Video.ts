import * as SVG from "svg.js";
import Utilities from "../../utilities/general";
import IGraphic from "./IGraphic";
import BoundingBox from "./BoundingBox";
import Point from "../Point";

export default class Video implements IGraphic {
    public id: string;
    public type: string = "video";
    public boundingBoxId: string;
    public origin: Point;
    public source: string;
    public rotation: number;

    constructor(
        { id, origin, source, rotation }:
            { id?: string, origin?: Point, source?: string, rotation?: number } = {}
    ) {
        this.id = id || Utilities.generateId();
        this.boundingBoxId = Utilities.generateId();
        this.origin = origin || new Point(0, 0);
        this.source = source || "";
        this.rotation = rotation || 0;
    }

    get boundingBox(): BoundingBox {
        return new BoundingBox(this.boundingBoxId, this.origin, 0, 0, this.rotation);
    }

    public render(canvas: SVG.Doc): SVG.Bare {
        const videoFrame: SVG.Bare = canvas
            .element("foreignObject")
            .size(560, 320)
            .attr("xmlns", "http://www.w3.org/1999/xhtml")
            .id(`graphic_${this.id}`);

        const video: HTMLVideoElement = document.createElement("video");
        video.src = this.source;
        video.controls = true;
        video.width = 100;
        video.height = 100;

        videoFrame.node.appendChild(video);
        return videoFrame;
    }

    public updateRendering(svg: SVG.Bare): void {
        svg.move(this.origin.x, this.origin.y)
            .rotate(this.rotation, this.origin.x, this.origin.y);
    }
}
