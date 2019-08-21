import * as SVG from 'svg.js';
import Utilities from '../../utilities';
import { IGraphic, ISlideWrapper, GraphicEditorFormat, Anchor, TextParameters } from '../../types';
import Vector from '../Vector';
import SnapVector from '../SnapVector';

export default class Text implements IGraphic {
    public id: string;
    public type: string = 'text';
    public defaultInteractive: boolean;
    public supplementary: boolean;
    public anchorIds: Array<string> = [];
    public origin: Vector;
    public content: string;
    public fontSize: number;
    public fontWeight: string;
    public fontFamily: string;
    public fillColor: string;
    public rotation: number;

    constructor({ id, defaultInteractive, supplementary, origin, content, fontSize, fontWeight, fontFamily, fillColor, rotation }: TextParameters = {}) {
        this.id = id || Utilities.generateId();
        this.defaultInteractive = defaultInteractive === undefined ? true : defaultInteractive;
        this.supplementary = supplementary === undefined ? false : supplementary;
        this.origin = origin || new Vector(0, 0);
        this.content = content || 'lorem ipsum dolor sit amet';
        this.fontSize = fontSize || 12;
        this.fontWeight = fontWeight || '400';
        this.fontFamily = fontFamily || 'Arial';
        this.fillColor = fillColor || '#000000';
        this.rotation = rotation || 0;
    }

    public render(canvas: SVG.Doc): SVG.Text {
        return canvas
            .text(this.content)
            .translate(this.origin.x, this.origin.y)
            .font({ size: this.fontSize, weight: this.fontWeight, family: this.fontFamily })
            .fill(this.fillColor)
            .rotate(this.rotation)
            .id(`graphic_${this.id}`);
    }

    public updateRendering(svg: SVG.Text): void {
        svg.text(this.content)
            .rotate(0)
            .translate(this.origin.x, this.origin.y)
            .font({ size: this.fontSize, weight: this.fontWeight, family: this.fontFamily })
            .fill(this.fillColor)
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
        return [];
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
                content: this.content,
                fontSize: this.fontSize,
                fontWeight: this.fontWeight,
                fontFamily: this.fontFamily,
                fillColor: this.fillColor,
                rotation: this.rotation
            }
        };
    }
}
