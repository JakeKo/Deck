import * as SVG from "svg.js";
import Utilities from "../../utilities";
import { IGraphic, CustomMouseEvent, ISlideWrapper, GraphicEditorFormat, BezierAnchorGraphics } from "../../types";
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
            points += `${index % 3 === 0 ? " C" : ""} ${point.x},${point.y}`;
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
            points += `${index % 3 === 0 ? " C" : ""} ${point.x},${point.y}`;
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
        // Form a collection of all anchor points (the set of points that are not bezier handles)
        const points: Array<Vector> = [Vector.zero, ...this.points].map((point: Vector): Vector => this.origin.add(point));
        const anchors: Array<{ index: number, graphic: IGraphic }> = [];
        for (let i = 0; i < points.length; i += 3) {
            anchors.push({ index: i, graphic: Utilities.makeAnchorGraphic(Utilities.generateId(), points[i]) });
        }

        // Refresh the anchor IDs
        this.anchorIds.length = 0;
        this.anchorIds.push(...anchors.map<string>((anchor: { index: number, graphic: IGraphic }): string => anchor.graphic.id));

        return anchors.map<Anchor>((anchor: { index: number, graphic: IGraphic }): Anchor => {
            return new Anchor(
                anchor.graphic,
                "move",
                (event: CustomMouseEvent): void => {
                    let bezierCurveGraphics: BezierAnchorGraphics;
                    if (anchor.index === 0) {
                        bezierCurveGraphics = Utilities.makeBezierCurvePointGraphic({
                            anchor: points[anchor.index],
                            firstHandle: points[anchor.index + 1]
                        });
                    } else if (anchor.index === points.length - 1) {
                        bezierCurveGraphics = Utilities.makeBezierCurvePointGraphic({
                            anchor: points[anchor.index],
                            firstHandle: points[anchor.index - 1]
                        });
                    } else {
                        bezierCurveGraphics = Utilities.makeBezierCurvePointGraphic({
                            anchor: points[anchor.index],
                            firstHandle: points[anchor.index - 1],
                            secondHandle: points[anchor.index + 1]
                        });
                    }

                    if (bezierCurveGraphics.secondHandle !== undefined && bezierCurveGraphics.secondHandleTrace !== undefined) {
                        slideWrapper.addGraphic(bezierCurveGraphics.secondHandleTrace);
                        slideWrapper.addGraphic(bezierCurveGraphics.secondHandle);
                    }

                    slideWrapper.addGraphic(bezierCurveGraphics.firstHandleTrace);
                    slideWrapper.addGraphic(bezierCurveGraphics.firstHandle);
                    slideWrapper.addGraphic(bezierCurveGraphics.anchor);

                    slideWrapper.removeGraphic(anchor.graphic.id);
                }
            );
        });
    }

    public toGraphicEditorFormat(): GraphicEditorFormat {
        return {
            metadata: {
                id: this.id,
                type: this.type,
                points: this.points,
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
