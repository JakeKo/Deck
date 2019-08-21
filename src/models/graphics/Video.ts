import * as SVG from 'svg.js';
import Utilities from '../../utilities';
import { IGraphic, CustomMouseEvent, ISlideWrapper, GraphicEditorFormat, Anchor, VideoParameters } from '../../types';
import Vector from '../Vector';
import SnapVector from '../SnapVector';

export default class Video implements IGraphic {
    public id: string;
    public type: string = 'video';
    public defaultInteractive: boolean;
    public supplementary: boolean;
    public anchorIds: Array<string> = [];
    public origin: Vector;
    public source: string;
    public width: number;
    public height: number;
    public rotation: number;

    constructor({ id, defaultInteractive, supplementary, origin, source, width, height, rotation }: VideoParameters = {}) {
        this.id = id || Utilities.generateId();
        this.defaultInteractive = defaultInteractive === undefined ? true : defaultInteractive;
        this.supplementary = supplementary === undefined ? false : supplementary;
        this.origin = origin || new Vector(0, 0);
        this.source = source || '';
        this.width = width || 0;
        this.height = height || 0;
        this.rotation = rotation || 0;
    }

    public render(canvas: SVG.Doc): SVG.Bare {
        const videoFrame: SVG.Bare = canvas
            .element('foreignObject')
            .size(this.width, this.height)
            .translate(this.origin.x, this.origin.y)
            .rotate(this.rotation)
            .id(`graphic_${this.id}`);

        const video: HTMLVideoElement = document.createElement('video');
        video.src = this.source;
        video.controls = false;
        video.style.objectFit = 'fill';

        const boundingRect: DOMRect | ClientRect = videoFrame.node.getBoundingClientRect();
        video.width = boundingRect.width;
        video.height = boundingRect.height;

        videoFrame.node.appendChild(video);
        return videoFrame;
    }

    public updateRendering(svg: SVG.Bare): void {
        const video: HTMLVideoElement | null = svg.node.querySelector('video');
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

    public getAnchors(slideWrapper: ISlideWrapper): Array<Anchor> {
        // Reset anchorIds with new ids for the to-be rendered anchors
        const anchorCount: number = 4;
        this.anchorIds.length = 0;
        for (let i = 0; i < anchorCount; i++) {
            this.anchorIds.push(Utilities.generateId());
        }

        // Create deep copies of the origin and the point opposite from the origin
        const baseOrigin: Vector = new Vector(this.origin.x, this.origin.y);
        const baseDimensions: Vector = new Vector(this.width, this.height);
        const self: Video = this;

        function adjust(origin: Vector): (event: CustomMouseEvent) => void {
            return function (event: CustomMouseEvent): void {
                const rawDimensions: Vector = origin.towards(slideWrapper.getPosition(event));
                const minimumDimension: number = Math.min(Math.abs(rawDimensions.x), Math.abs(rawDimensions.y));
                const resolvedDimensions: Vector = event.detail.baseEvent.shiftKey ? rawDimensions.transform(Math.sign).scale(minimumDimension) : rawDimensions;

                // Enforce that a shape has positive width and height i.e. move the x and y if the width or height are negative
                self.origin = origin.add(resolvedDimensions.scale(0.5)).add(resolvedDimensions.transform(Math.abs).scale(-0.5));
                self.width = Math.abs(resolvedDimensions.x);
                self.height = Math.abs(resolvedDimensions.y);
            };
        }

        return [
            {
                graphic: Utilities.makeAnchorGraphic(this.anchorIds[0], this.origin),
                cursor: 'move',
                handler: adjust(baseOrigin.add(baseDimensions))
            },
            {
                graphic: Utilities.makeAnchorGraphic(this.anchorIds[1], this.origin.add(new Vector(this.width, 0))),
                cursor: 'move',
                handler: adjust(baseOrigin.add(new Vector(0, baseDimensions.y)))
            },
            {
                graphic: Utilities.makeAnchorGraphic(this.anchorIds[2], this.origin.add(new Vector(this.width, this.height))),
                cursor: 'move',
                handler: adjust(baseOrigin)
            },
            {
                graphic: Utilities.makeAnchorGraphic(this.anchorIds[3], this.origin.add(new Vector(0, this.height))),
                cursor: 'move',
                handler: adjust(baseOrigin.add(new Vector(baseDimensions.x, 0)))
            }
        ];
    }

    public toGraphicEditorFormat(): GraphicEditorFormat {
        return {
            metadata: {
                id: this.id,
                type: this.type,
                defaultInteractive: this.defaultInteractive,
                supplementary: this.supplementary,
                anchorIds: this.anchorIds
            },
            data: {
                origin: this.origin,
                width: this.width,
                height: this.height,
                rotation: this.rotation
            }
        };
    }
}
