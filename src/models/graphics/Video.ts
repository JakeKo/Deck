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

    /*
    <foreignObject x="0" y="0" width="300" height="200">
        <video width="300" height="200" controls="" style="position: fixed; left: 151px; top: 104px;">
            <source src="http://techslides.com/demos/sample-videos/small.mp4" type="video/mp4">
        </video>
    </foreignObject>
    */
    public render(canvas: SVG.Doc): SVG.Bare {
        const video: SVG.Bare = canvas
            .element("video")
            .size(560, 320)
            .attr("controls", "1")
            .attr("src", this.source);

        const videoFrame: SVG.Bare = canvas
            .element("foreignObject")
            .size(560, 320)
            .id(`graphic_${this.id}`);

        videoFrame.node.appendChild(video.node);
        return videoFrame;
    }

    public updateRendering(svg: SVG.Bare): void {
        svg.move(this.origin.x, this.origin.y)
            .rotate(this.rotation, this.origin.x, this.origin.y);
    }
}
