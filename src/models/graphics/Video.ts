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
            .id(`graphic_${this.id}`);

        const video: HTMLVideoElement = document.createElement("video");
        video.src = this.source;
        video.controls = true;

        // Resive the video and video frame elements once the metadata for the video has loaded
        video.addEventListener("loadedmetadata", (event: Event): void => {
            const target: any = event.target;
            videoFrame.size(target.videoWidth, target.videoHeight);
            video.height = target.videoHeight;
            video.width = target.videoWidth;
        });

        videoFrame.node.appendChild(video);
        return videoFrame;
    }

    public updateRendering(svg: SVG.Bare): void {
        svg.move(this.origin.x, this.origin.y)
            .rotate(this.rotation, this.origin.x, this.origin.y);
    }
}
