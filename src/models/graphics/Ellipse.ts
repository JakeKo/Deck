import * as SVG from "svg.js";
import Utilities from "../../utilities/general";
import IGraphic from "./IGraphic";
import Vector from "../Vector";
import SnapVector from "../SnapVector";
import SlideWrapper from "../../utilities/SlideWrapper";
import Anchor from "../Anchor";
import GraphicMouseEvent from "../GraphicMouseEvent";
import IRectangularGraphic from "./IRectangularGraphic";

export default class Ellipse implements IGraphic, IRectangularGraphic {
    public id: string;
    public type: string = "ellipse";
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

        // Create deep copies of the origin and the point opposite from the origin
        const baseOrigin: Vector = new Vector(this.origin.x, this.origin.y);
        const baseAntiOrigin: Vector = this.origin.add(new Vector(this.width, this.height));

        return [
            new Anchor(
                Utilities.makeAnchorGraphic(this.anchorIds[0], this.origin),
                (event: CustomEvent<GraphicMouseEvent>): void => {
                    const positon: Vector = Utilities.getPosition(event, slideWrapper);
                    if (positon.x > baseAntiOrigin.x && positon.y > baseAntiOrigin.y) {
                        Utilities.adjustLowerRightAnchor(positon, this);
                    } else if (positon.x > baseAntiOrigin.x) {
                        Utilities.adjustUpperRightAnchor(positon, this);
                    } else if (positon.y > baseAntiOrigin.y) {
                        Utilities.adjustLowerLeftAnchor(positon, this);
                    } else {
                        Utilities.adjustUpperLeftAnchor(positon, this);
                    }
                }
            ),
            new Anchor(
                Utilities.makeAnchorGraphic(this.anchorIds[1], this.origin.add(new Vector(this.width, 0))),
                (event: CustomEvent<GraphicMouseEvent>): void => {
                    const positon: Vector = Utilities.getPosition(event, slideWrapper);
                    if (positon.x < baseOrigin.x && positon.y > baseAntiOrigin.y) {
                        Utilities.adjustLowerLeftAnchor(positon, this);
                    } else if (positon.x < baseOrigin.x) {
                        Utilities.adjustUpperLeftAnchor(positon, this);
                    } else if (positon.y > baseAntiOrigin.y) {
                        Utilities.adjustLowerRightAnchor(positon, this);
                    } else {
                        Utilities.adjustUpperRightAnchor(positon, this);
                    }
                }
            ),
            new Anchor(
                Utilities.makeAnchorGraphic(this.anchorIds[2], this.origin.add(new Vector(this.width, this.height))),
                (event: CustomEvent<GraphicMouseEvent>): void => {
                    const positon: Vector = Utilities.getPosition(event, slideWrapper);
                    if (positon.x < baseOrigin.x && positon.y < baseOrigin.y) {
                        Utilities.adjustUpperLeftAnchor(positon, this);
                    } else if (positon.x < baseOrigin.x) {
                        Utilities.adjustLowerLeftAnchor(positon, this);
                    } else if (positon.y < baseOrigin.y) {
                        Utilities.adjustUpperRightAnchor(positon, this);
                    } else {
                        Utilities.adjustLowerRightAnchor(positon, this);
                    }
                }
            ),
            new Anchor(
                Utilities.makeAnchorGraphic(this.anchorIds[3], this.origin.add(new Vector(0, this.height))),
                (event: CustomEvent<GraphicMouseEvent>): void => {
                    const positon: Vector = Utilities.getPosition(event, slideWrapper);
                    if (positon.x > baseAntiOrigin.x && positon.y < baseOrigin.y) {
                        Utilities.adjustUpperRightAnchor(positon, this);
                    } else if (positon.x > baseAntiOrigin.x) {
                        Utilities.adjustLowerRightAnchor(positon, this);
                    } else if (positon.y < baseOrigin.y) {
                        Utilities.adjustUpperLeftAnchor(positon, this);
                    } else {
                        Utilities.adjustLowerLeftAnchor(positon, this);
                    }
                }
            )
        ];
    }
}
