import Graphic from "../models/Graphic";
import Style from "../models/Style";
import Point from "../models/Point";
import * as SVG from "svg.js";

const render: (graphic: Graphic, canvas: SVG.Doc) => SVG.Element = (graphic: Graphic, canvas: SVG.Doc): SVG.Element => {
    const style: Style = graphic.style;

    if (graphic.type === "rectangle") {
        return canvas.rect(style.width, style.height)
            .move(style.x!, style.y!)
            .fill(style.fill!);
    } else if (graphic.type === "textbox") {
        return canvas.text(style.message || "")
            .move(style.x!, style.y!);
    } else if (graphic.type === "polyline") {
        return canvas.polyline(style.points!.map((point: Point) => point.toArray()))
            .fill(style.fill!)
            .stroke(style.stroke!)
            .attr("stroke-width", style.strokeWidth);
    } else if (graphic.type === "curve") {
        let points: string = `M ${style.points![0].x},${style.points![0].y}`;
        style.points!.slice(1).forEach((point: Point, index: number) => {
            points += `${index % 3 === 0 ? " C" : ""} ${point.x},${point.y}`;
        });

        return canvas.path(points)
            .fill(style.fill!)
            .stroke(style.stroke!)
            .attr("stroke-width", style.strokeWidth);
    } else if (graphic.type === "ellipse") {
        return canvas.ellipse(style.width, style.height)
            .center(style.x!, style.y!)
            .fill(style.fill!);
    }

    throw `Undefined type of graphic: ${graphic.type}`;
};

export default {
    render
};
