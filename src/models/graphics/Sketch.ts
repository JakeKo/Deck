import * as SVG from "svg.js";
import Utilities from "../../utilities/general";
import { IGraphic, CustomMouseEvent, ISlideWrapper, GraphicEditorFormat } from "../../types";
import Vector from "../Vector";
import SnapVector from "../SnapVector";
import Anchor from "../Anchor";

export default class Sketch implements IGraphic {
    public id: string;
    public type: string = "sketch";
    public defaultInteractive: boolean;
    public supplementary: boolean;
    public anchorIds: Array<string> = [];
    public origin: Vector;
    public points: Array<Vector>;
    public fillColor: string;
    public strokeColor: string;
    public strokeWidth: number;
    public rotation: number;

    constructor(
        { id, defaultInteractive, supplementary, origin, points, fillColor, strokeColor, strokeWidth, rotation }:
            { id?: string, defaultInteractive?: boolean, supplementary?: boolean, origin?: Vector, points?: Array<Vector>, fillColor?: string, strokeColor?: string, strokeWidth?: number, rotation?: number } = {}
    ) {
        this.id = id || Utilities.generateId();
        this.defaultInteractive = defaultInteractive === undefined ? true : defaultInteractive;
        this.supplementary = supplementary === undefined ? false : supplementary;
        this.origin = origin || new Vector(0, 0);
        this.points = points || [];
        this.fillColor = fillColor || "#EEEEEE";
        this.strokeColor = strokeColor || "#000000";
        this.strokeWidth = strokeWidth || 1;
        this.rotation = rotation || 0;
    }

    public render(canvas: SVG.Doc): SVG.PolyLine {
        return canvas
            .polyline(this.points.map((point: Vector) => point.toArray()))
            .translate(this.origin.x, this.origin.y)
            .fill(this.fillColor)
            .stroke({ color: this.strokeColor, width: this.strokeWidth })
            .rotate(this.rotation)
            .id(`graphic_${this.id}`);
    }

    public updateRendering(svg: SVG.PolyLine): void {
        svg.plot(this.points.map((point: Vector) => point.toArray()))
            .rotate(0)
            .translate(this.origin.x, this.origin.y)
            .fill(this.fillColor)
            .stroke({ color: this.strokeColor, width: this.strokeWidth })
            .rotate(this.rotation);
    }

    public getSnapVectors(): Array<SnapVector> {
        const snapVectors: Array<SnapVector> = [];

        // Center, upper center, left center, lower center, right center
        snapVectors.push(new SnapVector(this.id, this.origin,   Vector.right));
        snapVectors.push(new SnapVector(this.id, this.origin,   Vector.up));

        return snapVectors;
    }

    public getSnappableVectors(): Array<Vector> {
        const snappableVectors: Array<Vector> = [];

        // Center, upper center, left center, lower center, right center
        snappableVectors.push(this.origin);

        return snappableVectors;
    }

    public getAnchors(slideWrapper: ISlideWrapper): Array<Anchor> {
        // Reset anchorIds with new ids for the to-be rendered anchors
        this.anchorIds.length = 0;
        this.points.forEach((): void => void this.anchorIds.push(Utilities.generateId()));

        return this.anchorIds.map<Anchor>((anchorId: string, index: number): Anchor => {
            return new Anchor(
                Utilities.makeAnchorGraphic(anchorId, this.points[index].add(this.origin)),
                "move",
                (event: CustomMouseEvent): void => {
                    // Move the specific point on the curve to the mouse position
                    this.points[index] = slideWrapper.getPosition(event).add(this.origin.scale(-1));
                }
            );
        });
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
                fillColor: this.fillColor,
                strokeColor: this.strokeColor,
                strokeWidth: this.strokeWidth,
                rotation: this.rotation
            }
        };
    }
}
