import * as SVG from "svg.js";
import Utilities from "../../utilities";
import { IGraphic, CustomMouseEvent, ISlideWrapper, GraphicEditorFormat, Anchor } from "../../types";
import Vector from "../Vector";
import SnapVector from "../SnapVector";

export default class Rectangle implements IGraphic {
    public id: string;
    public type: string = "rectangle";
    public defaultInteractive: boolean;
    public supplementary: boolean;
    public anchorIds: Array<string> = [];
    public origin: Vector;
    public width: number;
    public height: number;
    public fillColor: string;
    public strokeColor: string;
    public strokeWidth: number;
    public rotation: number;

    constructor(
        { id, defaultInteractive, supplementary, origin, width, height, fillColor, strokeColor, strokeWidth, rotation }:
            { id?: string, defaultInteractive?: boolean, supplementary?: boolean, origin?: Vector, width?: number, height?: number, fillColor?: string, strokeColor?: string, strokeWidth?: number, rotation?: number } = {}
    ) {
        this.id = id || Utilities.generateId();
        this.defaultInteractive = defaultInteractive === undefined ? true : defaultInteractive;
        this.supplementary = supplementary === undefined ? false : supplementary;
        this.origin = origin || new Vector(0, 0);
        this.width = width || 50;
        this.height = height || 50;
        this.fillColor = fillColor || "#EEEEEE";
        this.strokeColor = strokeColor || "#000000";
        this.strokeWidth = strokeWidth || 1;
        this.rotation = rotation || 0;
    }

    public render(canvas: SVG.Doc): SVG.Rect {
        return canvas
            .rect(this.width, this.height)
            .translate(this.origin.x, this.origin.y)
            .fill(this.fillColor)
            .stroke({ color: this.strokeColor, width: this.strokeWidth })
            .rotate(this.rotation)
            .id(`graphic_${this.id}`);
    }

    public updateRendering(svg: SVG.Rect): void {
        svg.size(this.width, this.height)
            .rotate(0)
            .translate(this.origin.x, this.origin.y)
            .fill(this.fillColor)
            .stroke({ color: this.strokeColor, width: this.strokeWidth })
            .rotate(this.rotation);
    }

    public getSnapVectors(): Array<SnapVector> {
        const snapVectors: Array<SnapVector> = [];

        // Center, upper center, right center, lower center, left center
        snapVectors.push(new SnapVector(this.id, this.origin.add(new Vector(this.width / 2, this.height / 2)), Vector.right));
        snapVectors.push(new SnapVector(this.id, this.origin.add(new Vector(this.width / 2, this.height / 2)), Vector.up));
        snapVectors.push(new SnapVector(this.id, this.origin.add(new Vector(this.width / 2, 0)), Vector.right));
        snapVectors.push(new SnapVector(this.id, this.origin.add(new Vector(this.width, this.height / 2)), Vector.up));
        snapVectors.push(new SnapVector(this.id, this.origin.add(new Vector(this.width / 2, this.height)), Vector.right));
        snapVectors.push(new SnapVector(this.id, this.origin.add(new Vector(0, this.height / 2)), Vector.up));

        return snapVectors;
    }

    public getSnappableVectors(): Array<Vector> {
        const snappableVectors: Array<Vector> = [];

        // Upper left, upper right, lower right, lower left, center
        snappableVectors.push(this.origin);
        snappableVectors.push(this.origin.add(new Vector(this.width, 0)));
        snappableVectors.push(this.origin.add(new Vector(this.width, this.height)));
        snappableVectors.push(this.origin.add(new Vector(0, this.height / 2)));
        snappableVectors.push(this.origin.add(new Vector(this.width / 2, this.height / 2)));

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
        const self: Rectangle = this;

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
                cursor: "move",
                handler: adjust(baseOrigin.add(baseDimensions))
            },
            {
                graphic: Utilities.makeAnchorGraphic(this.anchorIds[1], this.origin.add(new Vector(this.width, 0))),
                cursor: "move",
                handler: adjust(baseOrigin.add(new Vector(0, baseDimensions.y)))
            },
            {
                graphic: Utilities.makeAnchorGraphic(this.anchorIds[2], this.origin.add(new Vector(this.width, this.height))),
                cursor: "move",
                handler: adjust(baseOrigin)
            },
            {
                graphic: Utilities.makeAnchorGraphic(this.anchorIds[3], this.origin.add(new Vector(0, this.height))),
                cursor: "move",
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
                fillColor: this.fillColor,
                strokeColor: this.strokeColor,
                strokeWidth: this.strokeWidth,
                rotation: this.rotation
            }
        };
    }
}
