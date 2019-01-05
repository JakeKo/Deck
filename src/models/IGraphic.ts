import Rectangle from "./Rectangle";

export default interface IGraphic {
    id: string;
    getBoundingBox(): Rectangle;
}
