import * as SVG from "svg.js";
import Utilities from "../../utilities/general";
import IGraphic from "./IGraphic";
import Vector from "../Vector";
import SnapVector from "../SnapVector";
import GraphicMouseEvent from "../GraphicMouseEvent";
import SlideWrapper from "../../utilities/SlideWrapper";

export default class Rectangle implements IGraphic {
    public id: string;
    public type: string = "rectangle";
    public boundingBoxId: string;
    public anchorIds: Array<string> = [];
    public origin: Vector;
    public width: number;
    public height: number;
    public fillColor: string;
    public strokeColor: string;
    public strokeWidth: number;
    public rotation: number;

    constructor(
        { id, origin, width, height, fillColor, strokeColor, strokeWidth, rotation }:
            { id?: string, origin?: Vector, width?: number, height?: number, fillColor?: string, strokeColor?: string, strokeWidth?: number, rotation?: number } = {}
    ) {
        this.id = id || Utilities.generateId();
        this.boundingBoxId = Utilities.generateId();
        this.origin = origin || new Vector(0, 0);
        this.width = width || 50;
        this.height = height || 50;
        this.fillColor = fillColor || "#EEEEEE";
        this.strokeColor = strokeColor || "#000000";
        this.strokeWidth = strokeWidth || 1;
        this.rotation = rotation || 0;

        const anchorCount: number = 4;
        for (let i = 0; i < anchorCount; i++) {
            this.anchorIds.push(Utilities.generateId());
        }
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

    public getAnchors(slideWrapper: SlideWrapper): Array<any> {
        const anchors: Array<any> = [
            {
                graphic: Utilities.makeAnchorGraphic(this.anchorIds[0], this.origin),
                handler: (event: CustomEvent<GraphicMouseEvent>): void => {
                    // TODO: Handle when the position crosses another point
                    const position: Vector = Utilities.getPosition(event, slideWrapper);
                    const dimensions: Vector = position.towards(this.origin.add(new Vector(this.width, this.height)));

                    this.origin = position;
                    this.width = dimensions.x;
                    this.height = dimensions.y;
                }
            },
            {
                graphic: Utilities.makeAnchorGraphic(this.anchorIds[1], this.origin.add(new Vector(this.width, 0))),
                handler: (event: CustomEvent<GraphicMouseEvent>): void => {
                    // TODO: Handle when the position crosses another point
                    const position: Vector = Utilities.getPosition(event, slideWrapper);

                    this.origin.y = position.y;
                    this.width = position.x - this.origin.x;
                }
            },
            {
                graphic: Utilities.makeAnchorGraphic(this.anchorIds[2], this.origin.add(new Vector(this.width, this.height))),
                handler: (event: CustomEvent<GraphicMouseEvent>): void => {
                    // TODO: Handle when the position crosses another point
                    const position: Vector = Utilities.getPosition(event, slideWrapper);
                    const dimensions: Vector = this.origin.towards(position);

                    this.width = dimensions.x;
                    this.height = dimensions.y;
                }
            },
            {
                graphic: Utilities.makeAnchorGraphic(this.anchorIds[3], this.origin.add(new Vector(0, this.height))),
                handler: (event: CustomEvent<GraphicMouseEvent>): void => {
                    // TODO: Handle when the position crosses another point
                    const position: Vector = Utilities.getPosition(event, slideWrapper);

                    this.origin.x = position.x;
                    this.height = position.y - this.origin.y;
                }
            },
        ];


        return anchors;
    }
}
