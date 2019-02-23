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
    public width: number;
    public height: number;
    public rotation: number;
    public metadataLoaded: boolean = false;

    constructor(
        { id, origin, source, width, height, rotation }:
            { id?: string, origin?: Point, source?: string, width?: number, height?: number, rotation?: number } = {}
    ) {
        this.id = id || Utilities.generateId();
        this.boundingBoxId = Utilities.generateId();
        this.origin = origin || new Point(0, 0);
        this.source = source || "";
        this.rotation = rotation || 0;
        this.width = width || 0;
        this.height = height || 0;

        const video: HTMLVideoElement = document.createElement("video");
        video.src = this.source;

        video.addEventListener("loadedmetadata", (event: Event): void => {
            const target: any = event.target;
            this.width = this.width || target.videoWidth;
            this.height = this.height || target.videoHeight;

            this.metadataLoaded = true;
            document.dispatchEvent(new CustomEvent("Deck.VideoMetadataLoaded", { detail: { graphicId: this.id }}));
        });
    }

    get boundingBox(): BoundingBox {
        return new BoundingBox(this.boundingBoxId, this.origin, this.width, this.height, this.rotation);
    }

    public render(canvas: SVG.Doc): SVG.Bare {
        const videoFrame: SVG.Bare = canvas
            .element("foreignObject")
            .size(this.width, this.height)
            .move(this.origin.x, this.origin.y)
            .rotate(this.rotation)
            .id(`graphic_${this.id}`);

        const video: HTMLVideoElement = document.createElement("video");
        video.src = this.source;
        video.controls = false;
        video.width = this.width;
        video.height = this.height;

        videoFrame.node.appendChild(video);
        return videoFrame;
    }

    public updateRendering(svg: SVG.Bare): void {
        svg.move(this.origin.x, this.origin.y)
            .size(this.width, this.height)
            .rotate(this.rotation, this.origin.x, this.origin.y);
    }
}
