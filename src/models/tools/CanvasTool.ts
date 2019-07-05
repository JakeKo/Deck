import { ICanvasTool, ISlideWrapper, CustomCanvasMouseEvent, CustomGraphicMouseEvent } from "../../types";

export default class CanvasTool implements ICanvasTool {
    public canvasMouseDown(slideWrapper: ISlideWrapper): (event: CustomCanvasMouseEvent) => void {
        return (): void => { return; };
    }

    public canvasMouseOver(slideWrapper: ISlideWrapper): (event: CustomCanvasMouseEvent) => void {
        return (): void => { return; };
    }

    public canvasMouseOut(slideWrapper: ISlideWrapper): (event: CustomCanvasMouseEvent) => void {
        return (): void => { return; };
    }

    public graphicMouseOver(slideWrapper: ISlideWrapper): (event: CustomGraphicMouseEvent) => void {
        return (): void => { return; };
    }

    public graphicMouseOut(slideWrapper: ISlideWrapper): (event: CustomGraphicMouseEvent) => void {
        return (): void => { return; };
    }

    public graphicMouseDown(slideWrapper: ISlideWrapper): (event: CustomGraphicMouseEvent) => void {
        return (): void => { return; };
    }
}
