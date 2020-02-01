import * as SVG from 'svg.js';
import Utilities from '../../utilities';
import { IGraphic, CustomMouseEvent, ISlideWrapper, GraphicEditorObject, RectangleParameters, Field } from '../../types';
import Vector from '../Vector';
import SnapVector from '../SnapVector';
import Anchor from './Anchor';

export default class Rectangle implements IGraphic {
    public id: string;
    public type: string = 'rectangle';
    public role: string;
    public anchorIds: Array<string> = [];
    public origin: Vector;
    public width: number;
    public height: number;
    public fillColor: string;
    public strokeColor: string;
    public strokeWidth: number;
    public rotation: number;

    constructor({ id, role, origin, width, height, fillColor, strokeColor, strokeWidth, rotation }: RectangleParameters = {}) {
        this.id = id || Utilities.generateId();
        this.role = role || 'default';
        this.origin = origin || new Vector(0, 0);
        this.width = width || 50;
        this.height = height || 50;
        this.fillColor = fillColor || '#EEEEEE';
        this.strokeColor = strokeColor || '#000000';
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
            Utilities.makeAnchorGraphic(this.id, adjust(baseOrigin.add(baseDimensions)), this.anchorIds[0], this.origin),
            Utilities.makeAnchorGraphic(this.id, adjust(baseOrigin.add(new Vector(0, baseDimensions.y))), this.anchorIds[1], this.origin.add(new Vector(this.width, 0))),
            Utilities.makeAnchorGraphic(this.id, adjust(baseOrigin), this.anchorIds[2], this.origin.add(new Vector(this.width, this.height))),
            Utilities.makeAnchorGraphic(this.id, adjust(baseOrigin.add(new Vector(baseDimensions.x, 0))), this.anchorIds[3], this.origin.add(new Vector(0, this.height)))
        ];
    }

    public toGraphicEditorObject(): GraphicEditorObject {
        return {
            metadata: {
                id: this.id,
                type: this.type,
                anchorIds: this.anchorIds
            },
            data: [
                {
                    displayName: 'X',
                    inputType: 'number',
                    value: this.origin.x
                },
                {
                    displayName: 'Y',
                    inputType: 'number',
                    value: this.origin.y
                },
                {
                    displayName: 'Width',
                    inputType: 'number',
                    value: this.width
                },
                {
                    displayName: 'Height',
                    inputType: 'number',
                    value: this.height
                },
                {
                    displayName: 'Fill Color',
                    inputType: 'color',
                    value: this.fillColor
                },
                {
                    displayName: 'Stroke Color',
                    inputType: 'color',
                    value: this.strokeColor
                },
                {
                    displayName: 'Stroke Width',
                    inputType: 'number',
                    value: this.strokeWidth
                },
                {
                    displayName: 'Rotation',
                    inputType: 'number',
                    value: this.rotation
                }
            ]
        };
    }
}
