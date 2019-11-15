import Ellipse from "./Ellipse";
import { EllipseParameters, CustomMouseEvent } from "../../types";

export default class Anchor extends Ellipse {
    public parentGraphicId: string;
    public handler: (event: CustomMouseEvent) => void;

    constructor(parentGraphicId: string, handler: (event: CustomMouseEvent) => void, ellipseParameters: EllipseParameters = {}) {
        super(ellipseParameters);
        this.parentGraphicId = parentGraphicId;
        this.handler = handler;
    }
}
