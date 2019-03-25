import * as SVG from "svg.js";
import Utilities from "../../utilities/general";
import IGraphic from "./IGraphic";
import Vector from "../Vector";
import SnapVector from "../SnapVector";

export default class Video implements IGraphic {
    public id: string;
    public type: string = "video";
    public boundingBoxId: string;
    public origin: Vector;
    public source: string;
    public width: number;
    public height: number;
    public rotation: number;

    constructor(
        { id, origin, source, width, height, rotation }:
            { id?: string, origin?: Vector, source?: string, width?: number, height?: number, rotation?: number } = {}
    ) {
        this.id = id || Utilities.generateId();
        this.boundingBoxId = Utilities.generateId();
        this.origin = origin || new Vector(0, 0);
        this.source = source || "";
        this.width = width || 0;
        this.height = height || 0;
        this.rotation = rotation || 0;
    }

    public render(canvas: SVG.Doc): SVG.Bare {
        const videoFrame: SVG.Bare = canvas
            .element("foreignObject")
            .size(this.width, this.height)
            .translate(this.origin.x, this.origin.y)
            .rotate(this.rotation)
            .id(`graphic_${this.id}`);

        const video: HTMLVideoElement = document.createElement("video");
        video.src = this.source;
        video.controls = false;
        video.style.objectFit = "fill";

        const boundingRect: DOMRect | ClientRect = videoFrame.node.getBoundingClientRect();
        video.width = boundingRect.width;
        video.height = boundingRect.height;

        videoFrame.node.appendChild(video);
        return videoFrame;
    }

    public updateRendering(svg: SVG.Bare): void {
        const video: HTMLVideoElement | null = svg.node.querySelector("video");
        if (video === null) {
            console.error(`ERROR: Video element is missing on graphic with id: ${this.id}`);
            return;
        }

        svg.rotate(0)
            .translate(this.origin.x, this.origin.y)
            .size(this.width, this.height)
            .rotate(this.rotation);

        const boundingRect: DOMRect | ClientRect = svg.node.getBoundingClientRect();
        video.width = boundingRect.width;
        video.height = boundingRect.height;
    }

    public getSnapVectors(svg: SVG.Bare): Array<SnapVector> {
        const snapVectors: Array<SnapVector> = [];

        // Center, upper center, left center, lower center, right center
        snapVectors.push(new SnapVector(Utilities.transform(new Vector(this.width / 2, this.height / 2), svg), Vector.right));
        snapVectors.push(new SnapVector(Utilities.transform(new Vector(this.width / 2, this.height / 2), svg), Vector.up));
        snapVectors.push(new SnapVector(Utilities.transform(new Vector(this.width / 2, 0), svg), Vector.right));
        snapVectors.push(new SnapVector(Utilities.transform(new Vector(this.width, this.height / 2), svg), Vector.up));
        snapVectors.push(new SnapVector(Utilities.transform(new Vector(this.width / 2, this.height), svg), Vector.right));
        snapVectors.push(new SnapVector(Utilities.transform(new Vector(0, this.height / 2), svg), Vector.up));

        return snapVectors;
    }
}
