import * as SVG from 'svg.js';
import Utilities from '../../utilities';
import { IGraphic, CustomMouseEvent, ISlideWrapper, GraphicEditorObject, BezierAnchorGraphics, CurveParameters, Field } from '../../types';
import Vector from '../Vector';
import SnapVector from '../SnapVector';
import Anchor from './Anchor';

export default class Curve implements IGraphic {
    public id: string;
    public type: string = 'curve';
    public role: string;
    public anchorIds: Array<string> = [];
    public origin: Vector;
    public points: Array<Vector>;
    public fillColor: string;
    public strokeColor: string;
    public strokeWidth: number;
    public rotation: number;

    constructor({ id, role, origin, points, fillColor, strokeColor, strokeWidth, rotation }: CurveParameters = {}) {
        this.id = id || Utilities.generateId();
        this.role = role || 'default';
        this.origin = origin || new Vector(0, 0);
        this.points = points || [];
        this.fillColor = fillColor || '#EEEEEE';
        this.strokeColor = strokeColor || '#000000';
        this.strokeWidth = strokeWidth || 1;
        this.rotation = rotation || 0;
    }

    public render(canvas: SVG.Doc): SVG.Path {
        // Reformat points from an array of objects to the bezier curve string
        let points: string = `M 0,0`;
        this.points.forEach((point: Vector, index: number): void => {
            points += `${index % 3 === 0 ? ' C' : ''} ${point.x},${point.y}`;
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
        let points: string = 'M 0,0';
        this.points.forEach((point: Vector, index: number): void => {
            points += `${index % 3 === 0 ? ' C' : ''} ${point.x},${point.y}`;
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
        const anchors: Array<{ index: number, graphicId: string }> = [];
        for (let i = 0; i < points.length; i += 3) {
            anchors.push({ index: i, graphicId: Utilities.generateId() });
        }

        // Refresh the anchor IDs
        this.anchorIds.length = 0;
        this.anchorIds.push(...anchors.map<string>(({ graphicId }: { graphicId: string }): string => graphicId));

        return anchors.map<Anchor>((anchor: { index: number, graphicId: string }): Anchor => {
            return Utilities.makeAnchorGraphic(this.id, (event: CustomMouseEvent): void => {
                let bezierCurveGraphics: BezierAnchorGraphics;
                if (anchor.index === 0) {
                    bezierCurveGraphics = Utilities.makeBezierCurveAnchor(this.id, {
                        baseOrigin: points[anchor.index],
                        firstOrigin: points[anchor.index + 1]
                    });

                    // NOTE: Do not move origin because that seriously messes with things
                } else if (anchor.index === points.length - 1) {
                    bezierCurveGraphics = Utilities.makeBezierCurveAnchor(this.id, {
                        baseOrigin: points[anchor.index],
                        firstOrigin: points[anchor.index - 1]
                    });

                    const firstHandleOffset: Vector = this.points[anchor.index - 1].towards(this.points[anchor.index - 2]);
                    this.points[anchor.index - 1] = this.origin.towards(slideWrapper.getPosition(event));
                    this.points[anchor.index - 2] = this.points[anchor.index - 1].add(firstHandleOffset);
                } else {
                    bezierCurveGraphics = Utilities.makeBezierCurveAnchor(this.id, {
                        baseOrigin: points[anchor.index],
                        firstOrigin: points[anchor.index - 1],
                        secondOrigin: points[anchor.index + 1]
                    });

                    const firstHandleOffset: Vector = this.points[anchor.index - 1].towards(this.points[anchor.index - 2]);
                    const secondHandleOffset: Vector = this.points[anchor.index - 1].towards(this.points[anchor.index]);
                    this.points[anchor.index - 1] = this.origin.towards(slideWrapper.getPosition(event));
                    this.points[anchor.index - 2] = this.points[anchor.index - 1].add(firstHandleOffset);
                    this.points[anchor.index] = this.points[anchor.index - 1].add(secondHandleOffset);
                }

                slideWrapper.removeGraphic(anchor.graphicId);
            }, anchor.graphicId, points[anchor.index]);
        });
    }

    public toGraphicEditorObject(): GraphicEditorObject {
        return {
            metadata: {
                id: this.id,
                type: this.type,
                points: this.points,
                anchorIds: this.anchorIds
            },
            data: [
                {
                    displayName: 'X',
                    propertyName: 'x',
                    inputType: 'number',
                    value: this.origin.x
                },
                {
                    displayName: 'Y',
                    propertyName: 'y',
                    inputType: 'number',
                    value: this.origin.y
                },
                {
                    displayName: 'Fill Color',
                    propertyName: 'fillColor',
                    inputType: 'color',
                    value: this.fillColor
                },
                {
                    displayName: 'Stroke Color',
                    propertyName: 'strokeColor',
                    inputType: 'color',
                    value: this.strokeColor
                },
                {
                    displayName: 'Stroke Width',
                    propertyName: 'strokeWidth',
                    inputType: 'number',
                    value: this.strokeWidth
                },
                {
                    displayName: 'Rotation',
                    propertyName: 'rotation',
                    inputType: 'number',
                    value: this.rotation
                }
            ]
        };
    }
}
