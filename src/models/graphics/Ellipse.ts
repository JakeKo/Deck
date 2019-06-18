import * as SVG from "svg.js";
import Utilities from "../../utilities/general";
import IGraphic from "./IGraphic";
import Vector from "../Vector";
import SnapVector from "../SnapVector";
import SlideWrapper from "../../utilities/SlideWrapper";
import Anchor from "../Anchor";
import GraphicMouseEvent from "../GraphicMouseEvent";
import CanvasMouseEvent from "../CanvasMouseEvent";

export default class Ellipse implements IGraphic {
    public id: string;
    public type: string = "ellipse";
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

    public render(canvas: SVG.Doc): SVG.Ellipse {
        return canvas
            .ellipse(this.width, this.height)
            .translate(this.origin.x, this.origin.y)
            .fill(this.fillColor)
            .stroke({ color: this.strokeColor, width: this.strokeWidth })
            .rotate(this.rotation)
            .id(`graphic_${this.id}`);
    }

    public updateRendering(svg: SVG.Ellipse): void {
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
        snapVectors.push(new SnapVector(this.id, this.origin, Vector.right));
        snapVectors.push(new SnapVector(this.id, this.origin, Vector.up));
        snapVectors.push(new SnapVector(this.id, this.origin.add(new Vector(0, -this.height / 2)), Vector.right));
        snapVectors.push(new SnapVector(this.id, this.origin.add(new Vector(this.width / 2, 0)), Vector.up));
        snapVectors.push(new SnapVector(this.id, this.origin.add(new Vector(0, this.height / 2)), Vector.right));
        snapVectors.push(new SnapVector(this.id, this.origin.add(new Vector(-this.width / 2, 0)), Vector.up));

        return snapVectors;
    }

    public getSnappableVectors(): Array<Vector> {
        const snappableVectors: Array<Vector> = [];

        // Center, upper center, left center, lower center, right center
        snappableVectors.push(this.origin.add(new Vector(-this.width / 2, -this.height / 2)));
        snappableVectors.push(this.origin.add(new Vector(this.width / 2, -this.height / 2)));
        snappableVectors.push(this.origin.add(new Vector(this.width / 2, this.height / 2)));
        snappableVectors.push(this.origin.add(new Vector(-this.width / 2, this.height / 2)));
        snappableVectors.push(this.origin);

        return snappableVectors;
    }

    public getAnchors(slideWrapper: SlideWrapper): Array<Anchor> {
        // Reset anchorIds with new ids for the to-be rendered anchors
        const anchorCount: number = 4;
        this.anchorIds.length = 0;
        for (let i = 0; i < anchorCount; i++) {
            this.anchorIds.push(Utilities.generateId());
        }

        // Create deep copies of the origin and the point opposite from the origin
        const baseOrigin: Vector = this.origin.add(new Vector(-this.width / 2, -this.height / 2));
        const baseDimensions: Vector = new Vector(this.width, this.height);
        const self: Ellipse = this;

        function adjust(origin: Vector): (event: CustomEvent<GraphicMouseEvent | CanvasMouseEvent>) => void {
            return function (event: CustomEvent<GraphicMouseEvent | CanvasMouseEvent>): void {
                const rawDimensions: Vector = origin.towards(slideWrapper.getPosition(event));
                const minimumDimension: number = Math.min(Math.abs(rawDimensions.x), Math.abs(rawDimensions.y));
                const resolvedDimensions: Vector = event.detail.baseEvent.shiftKey ? rawDimensions.transform(Math.sign).scale(minimumDimension) : rawDimensions;

                // Enforce that a shape has positive width and height i.e. move the x and y if the width or height are negative
                self.origin = origin.add(resolvedDimensions.scale(0.5));
                self.width = Math.abs(resolvedDimensions.x);
                self.height = Math.abs(resolvedDimensions.y);
            };
        }

        return [
            new Anchor(
                Utilities.makeAnchorGraphic(this.anchorIds[0], this.origin.add(new Vector(-this.width / 2, -this.height / 2))),
                "move",
                adjust(baseOrigin.add(baseDimensions))),
            new Anchor(
                Utilities.makeAnchorGraphic(this.anchorIds[1], this.origin.add(new Vector(this.width / 2, -this.height / 2))),
                "move",
                adjust(baseOrigin.add(new Vector(0, baseDimensions.y)))),
            new Anchor(
                Utilities.makeAnchorGraphic(this.anchorIds[2], this.origin.add(new Vector(this.width / 2, this.height / 2))),
                "move",
                adjust(baseOrigin)),
            new Anchor(
                Utilities.makeAnchorGraphic(this.anchorIds[3], this.origin.add(new Vector(-this.width / 2, this.height / 2))),
                "move",
                adjust(baseOrigin.add(new Vector(baseDimensions.x, 0))))
        ];
    }
}
