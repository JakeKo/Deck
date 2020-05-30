import Utilities from '../utilities';
import { IGraphic, SlideExportObject, SlideModelParameters, ISlideWrapper } from '../types';
import SnapVector from './SnapVector';
import Vector from './Vector';

export default class SlideModel {
    public id: string;
    public graphics: Array<IGraphic>;
    public snapVectors: Set<SnapVector>;
    public slideWrapper?: ISlideWrapper;
    public isRendered: boolean;
    public topic: string;
    public height: number;
    public width: number;

    constructor({ id, graphics, snapVectors, slideWrapper, isRendered, topic, width, height }: SlideModelParameters) {
        this.id = id || Utilities.generateId();
        this.graphics = graphics || new Array<IGraphic>();
        this.topic = topic || '';
        this.slideWrapper = slideWrapper;
        this.isRendered = isRendered || false;
        this.snapVectors = new Set<SnapVector>([
            new SnapVector('slide', new Vector(width / 2, 0), Vector.right),
            new SnapVector('slide', new Vector(width, height / 2), Vector.up),
            new SnapVector('slide', new Vector(width / 2, height), Vector.right),
            new SnapVector('slide', new Vector(0, height / 2), Vector.up),
            new SnapVector('slide', new Vector(width / 2, height / 2), Vector.right),
            new SnapVector('slide', new Vector(width / 2, height / 2), Vector.up),
            ...snapVectors || new Array<SnapVector>()
        ]);

        this.width = width;
        this.height = height;
    }

    public toExportObject(): SlideExportObject {
        return {
            id: this.id,
            graphics: this.graphics,
            topic: this.topic,
            height: this.height,
            width: this.width
        };
    }

    public addSnapVectors(...snapVectors: Array<SnapVector>): void {
        snapVectors.forEach((snapVector: SnapVector): void => void this.snapVectors.add(snapVector));
    }

    public getGraphic(graphicId: string | undefined): IGraphic | undefined {
        return this.graphics.find((graphic: IGraphic): boolean => graphic.id === graphicId);
    }

    public removeGraphic(graphicId: string): IGraphic {
        const index: number = this.graphics.findIndex((graphic: IGraphic): boolean => graphic.id === graphicId);

        if (index === -1) {
            throw `No graphic with id ${graphicId} on slide with id ${this.id}`;
        }

        this.slideWrapper!.removeGraphic(graphicId);
        return this.graphics.splice(index, 1)[0];
    }

    public addGraphic(graphic: IGraphic): void {
        this.slideWrapper!.addGraphic(graphic);
        this.graphics.push(graphic);
    }

    public updateGraphic(id: string, graphic: IGraphic): void {
        const index: number = this.graphics.findIndex((graphic: IGraphic): boolean => graphic.id === id);

        if (index === -1) {
            throw `No graphic with id ${id} on slide with id ${this.id}`;
        }

        this.graphics[index] = graphic;
        this.slideWrapper!.updateGraphic(id, graphic);
    }
}
