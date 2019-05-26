import * as SVG from "svg.js";
import Utilities from "../../utilities/general";
import IGraphic from "./IGraphic";
import Vector from "../Vector";
import SnapVector from "../SnapVector";
import GraphicMouseEvent from "../GraphicMouseEvent";
import SlideWrapper from "../../utilities/SlideWrapper";
import Anchor from "../Anchor";
import IRectangularGraphic from "./IRectangularGraphic";
import CanvasMouseEvent from "../CanvasMouseEvent";

export default class Rectangle implements IGraphic, IRectangularGraphic {
    public id: string;
    public type: string = "rectangle";
    public boundingBoxId: string = Utilities.generateId();
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

        // Center, upper center, left center, lower center, right center
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

    public getAnchors(slideWrapper: SlideWrapper): Array<Anchor> {
        // Reset anchorIds with new ids for the to-be rendered anchors
        const anchorCount: number = 4;
        this.anchorIds.length = 0;
        for (let i = 0; i < anchorCount; i++) {
            this.anchorIds.push(Utilities.generateId());
        }

        // Create deep copies of the origin and the point opposite from the origin
        const baseOrigin: Vector = new Vector(this.origin.x, this.origin.y);
        const baseDimensions: Vector = new Vector(this.width, this.height);

        return [
            new Anchor(Utilities.makeAnchorGraphic(this.anchorIds[0], this.origin),
                "move",
                (event: CustomEvent<GraphicMouseEvent | CanvasMouseEvent>): void => {
                    const position: Vector = Utilities.getPosition(event, slideWrapper);
                    const adjustment: Vector = baseOrigin.add(baseDimensions).towards(position);
                    const absoluteAdjustment: Vector = adjustment.transform(Math.abs);
                    this.origin = baseOrigin.add(baseDimensions).add(adjustment.scale(0.5)).add(absoluteAdjustment.scale(-0.5));
                    this.width = absoluteAdjustment.x;
                    this.height = absoluteAdjustment.y;
                }),
            new Anchor(Utilities.makeAnchorGraphic(this.anchorIds[1], this.origin.add(new Vector(this.width, 0))),
                "move",
                (event: CustomEvent<GraphicMouseEvent | CanvasMouseEvent>): void => {
                    const position: Vector = Utilities.getPosition(event, slideWrapper);
                    const adjustment: Vector = baseOrigin.add(new Vector(0, baseDimensions.y)).towards(position);
                    const absoluteAdjustment: Vector = adjustment.transform(Math.abs);
                    this.origin = baseOrigin.add(new Vector(0, baseDimensions.y)).add(adjustment.scale(0.5)).add(absoluteAdjustment.scale(-0.5));
                    this.width = absoluteAdjustment.x;
                    this.height = absoluteAdjustment.y;
                }),
            new Anchor(Utilities.makeAnchorGraphic(this.anchorIds[2], this.origin.add(new Vector(this.width, this.height))),
                "move",
                (event: CustomEvent<GraphicMouseEvent | CanvasMouseEvent>): void => {
                    const position: Vector = Utilities.getPosition(event, slideWrapper);
                    const adjustment: Vector = baseOrigin.towards(position);
                    const absoluteAdjustment: Vector = adjustment.transform(Math.abs);
                    this.origin = baseOrigin.add(adjustment.scale(0.5)).add(absoluteAdjustment.scale(-0.5));
                    this.width = absoluteAdjustment.x;
                    this.height = absoluteAdjustment.y;
                }),
            new Anchor(Utilities.makeAnchorGraphic(this.anchorIds[3], this.origin.add(new Vector(0, this.height))),
                "move",
                (event: CustomEvent<GraphicMouseEvent | CanvasMouseEvent>): void => {
                    const position: Vector = Utilities.getPosition(event, slideWrapper);
                    const adjustment: Vector = baseOrigin.add(new Vector(baseDimensions.x, 0)).towards(position);
                    const absoluteAdjustment: Vector = adjustment.transform(Math.abs);
                    this.origin = baseOrigin.add(new Vector(baseDimensions.x, 0)).add(adjustment.scale(0.5)).add(absoluteAdjustment.scale(-0.5));
                    this.width = absoluteAdjustment.x;
                    this.height = absoluteAdjustment.y;
                })
        ];
    }
}
