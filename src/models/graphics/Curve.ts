import * as SVG from "svg.js";
import Utilities from "../../utilities/general";
import { IGraphic, CustomMouseEvent, ISlideWrapper } from "../../types";
import Vector from "../Vector";
import SnapVector from "../SnapVector";
import Anchor from "../Anchor";

export default class Curve implements IGraphic {
    public id: string;
    public type: string = "curve";
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

    public render(canvas: SVG.Doc): SVG.Path {
        // Reformat points from an array of objects to the bezier curve string
        let points: string = `M 0,0`;
        this.points.forEach((point: Vector, index: number): void => {
            points += `${index % 3 === 0 ? " c" : ""} ${point.x},${point.y}`;
        });

        return canvas
            .path(points)
            .translate(this.origin.x, this.origin.y)
            .fill(this.fillColor)
            .stroke({ color: this.strokeColor, width: this.strokeWidth })
            .rotate(this.rotation)
            .id(`graphic_${this.id}`);
    }

    public updateRendering(svg: SVG.Path): void {
        // Reformat points from an array of objects to the bezier curve string
        let points: string = "M 0,0";
        this.points.forEach((point: Vector, index: number): void => {
            points += `${index % 3 === 0 ? " c" : ""} ${point.x},${point.y}`;
        });

        svg.plot(points)
            .rotate(0)
            .translate(this.origin.x, this.origin.y)
            .fill(this.fillColor)
            .stroke({ color: this.strokeColor, width: this.strokeWidth })
            .rotate(this.rotation);
    }

    public getSnapVectors(): Array<SnapVector> {
        const snapVectors: Array<SnapVector> = [];

        // Center, upper center, left center, lower center, right center
        snapVectors.push(new SnapVector(this.id, this.origin, Vector.right));
        snapVectors.push(new SnapVector(this.id, this.origin, Vector.up));

        return snapVectors;
    }

    public getSnappableVectors(): Array<Vector> {
        const snappableVectors: Array<Vector> = [];

        // Center, upper center, left center, lower center, right center
        snappableVectors.push(this.origin);

        return snappableVectors;
    }

    public getAnchors(slideWrapper: ISlideWrapper): Array<Anchor> {
        const points: Array<Vector> = [ new Vector(0, 0), ...this.points ];

        // Reset anchorIds with new ids for the to-be rendered anchors
        this.anchorIds.length = 0;
        points.forEach((): void => void this.anchorIds.push(Utilities.generateId()));

        return this.anchorIds.map<Anchor>((anchorId: string, index: number): Anchor => {
            return new Anchor(
                Utilities.makeAnchorGraphic(anchorId, this.origin.add(points[index])),
                "move",
                (event: CustomMouseEvent): void => {
                    // Move the specific point on the curve to the mouse position
                    const position: Vector = slideWrapper.getPosition(event);
                    if (index === 0) {
                        this.origin = position;
                    } else {
                        this.points[index - 1] = this.origin.towards(position);
                    }
                }
            );
        });
    }
}
