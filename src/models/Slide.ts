import Utilities from "../utilities";
import { IGraphic, SlideExportObject, SlideParameters } from "../types";
import SnapVector from "./SnapVector";
import Vector from "./Vector";

export default class Slide {
    public id: string;
    public graphics: Array<IGraphic>;
    public snapVectors: Set<SnapVector>;
    public topic: string;
    public height: number;
    public width: number;

    constructor({ id, graphics, snapVectors, topic, width, height }: SlideParameters) {
        this.id = id || Utilities.generateId();
        this.graphics = graphics || new Array<IGraphic>();
        this.topic = topic || "";
        this.snapVectors = new Set<SnapVector>([
            new SnapVector("slide", new Vector(width / 2, 0), Vector.right),
            new SnapVector("slide", new Vector(width, height / 2), Vector.up),
            new SnapVector("slide", new Vector(width / 2, height), Vector.right),
            new SnapVector("slide", new Vector(0, height / 2), Vector.up),
            new SnapVector("slide", new Vector(width / 2, height / 2), Vector.right),
            new SnapVector("slide", new Vector(width / 2, height / 2), Vector.up),
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

        return this.graphics.splice(index, 1)[0];
    }
}
