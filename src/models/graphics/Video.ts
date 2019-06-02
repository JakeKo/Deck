import * as SVG from "svg.js";
import Utilities from "../../utilities/general";
import IGraphic from "./IGraphic";
import Vector from "../Vector";
import SnapVector from "../SnapVector";
import SlideWrapper from "../../utilities/SlideWrapper";
import Anchor from "../Anchor";
import GraphicMouseEvent from "../GraphicMouseEvent";
import IRectangularGraphic from "./IRectangularGraphic";
import CanvasMouseEvent from "../CanvasMouseEvent";

export default class Video implements IGraphic, IRectangularGraphic {
    public id: string;
    public type: string = "video";
    public defaultInteractive: boolean;
    public supplementary: boolean;
    public anchorIds: Array<string> = [];
    public origin: Vector;
    public source: string;
    public width: number;
    public height: number;
    public rotation: number;

    constructor(
        { id, defaultInteractive, supplementary, origin, source, width, height, rotation }:
            { id?: string, defaultInteractive?: boolean, supplementary?: boolean, origin?: Vector, source?: string, width?: number, height?: number, rotation?: number } = {}
    ) {
        this.id = id || Utilities.generateId();
        this.defaultInteractive = defaultInteractive === undefined ? true : defaultInteractive;
        this.supplementary = supplementary === undefined ? false : supplementary;
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

    public getSnapVectors(): Array<SnapVector> {
        const snapVectors: Array<SnapVector> = [];

        // Center, upper center, left center, lower center, right center
        snapVectors.push(new SnapVector(this.id, new Vector(this.origin.x + this.width / 2, this.origin.y + this.height / 2), Vector.right));
        snapVectors.push(new SnapVector(this.id, new Vector(this.origin.x + this.width / 2, this.origin.y + this.height / 2), Vector.up));
        snapVectors.push(new SnapVector(this.id, new Vector(this.origin.x + this.width / 2, this.origin.y), Vector.right));
        snapVectors.push(new SnapVector(this.id, new Vector(this.origin.x + this.width, this.origin.y + this.height / 2), Vector.up));
        snapVectors.push(new SnapVector(this.id, new Vector(this.origin.x + this.width / 2, this.origin.y + this.height), Vector.right));
        snapVectors.push(new SnapVector(this.id, new Vector(this.origin.x, this.origin.y + this.height / 2), Vector.up));

        return snapVectors;
    }

    public getSnappableVectors(): Array<Vector> {
        const snappableVectors: Array<Vector> = [];

        // Center, upper center, left center, lower center, right center
        snappableVectors.push(new Vector(this.origin.x, this.origin.y));
        snappableVectors.push(new Vector(this.origin.x + this.width, this.origin.y));
        snappableVectors.push(new Vector(this.origin.x + this.width, this.origin.y + this.height));
        snappableVectors.push(new Vector(this.origin.x, this.origin.y + this.height / 2));
        snappableVectors.push(new Vector(this.origin.x + this.width / 2, this.origin.y + this.height / 2));

        return snappableVectors;
    }

    public getAnchors(slideWrapper: SlideWrapper): Array<Anchor> {
        // Reset anchorIds with new ids for the to-be rendered anchors
        const anchorCount: number = 4;
        this.anchorIds.length = 0;
        for (let i = 0; i < anchorCount; i++) {
            this.anchorIds.push(Utilities.generateId());
        }

        return [
            new Anchor(
                Utilities.makeAnchorGraphic(this.anchorIds[0], this.origin),
                "move",
                (event: CustomEvent<GraphicMouseEvent | CanvasMouseEvent>): void => {
                    return;
                }
            ),
            new Anchor(
                Utilities.makeAnchorGraphic(this.anchorIds[1], this.origin.add(new Vector(this.width, 0))),
                "move",
                (event: CustomEvent<GraphicMouseEvent | CanvasMouseEvent>): void => {
                    return;
                }
            ),
            new Anchor(
                Utilities.makeAnchorGraphic(this.anchorIds[2], this.origin.add(new Vector(this.width, this.height))),
                "move",
                (event: CustomEvent<GraphicMouseEvent | CanvasMouseEvent>): void => {
                    return;
                }
            ),
            new Anchor(
                Utilities.makeAnchorGraphic(this.anchorIds[3], this.origin.add(new Vector(0, this.height))),
                "move",
                (event: CustomEvent<GraphicMouseEvent | CanvasMouseEvent>): void => {
                    return;
                }
            )
        ];
    }
}
