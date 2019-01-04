import Graphic from "../models/Graphic";
import Style from "../models/Style";
import Point from "../models/Point";
import * as SVG from "svg.js";

function render(graphic: Graphic, canvas: SVG.Doc): SVG.Element {
    const style: Style = graphic.style;

    if (graphic.type === "rectangle") {
        return canvas.rect(style.width, style.height)
            .move(style.x!, style.y!)
            .fill(style.fill!)
            .stroke({ color: style.stroke, width: style.strokeWidth });
    } else if (graphic.type === "text") {
        return canvas.text(style.message || "")
            .move(style.x!, style.y!);
    } else if (graphic.type === "polyline") {
        return canvas.polyline(style.points!.map((point: Point) => point.toArray()))
            .fill(style.fill!)
            .stroke({ color: style.stroke, width: style.strokeWidth });
    } else if (graphic.type === "curve") {
        let points: string = `M ${style.points![0].x},${style.points![0].y}`;
        style.points!.slice(1).forEach((point: Point, index: number) => {
            points += `${index % 3 === 0 ? " C" : ""} ${point.x},${point.y}`;
        });

        return canvas.path(points)
            .fill(style.fill!)
            .stroke({ color: style.stroke, width: style.strokeWidth });
    } else if (graphic.type === "ellipse") {
        return canvas.ellipse(style.width, style.height)
            .center(style.x!, style.y!)
            .fill(style.fill!);
    }

    throw `Undefined type of graphic: ${graphic.type}`;
}

function modelBoundingBox(graphic: Graphic): Graphic {
    if (graphic.type === "rectangle") {
        return new Graphic({
            type: "rectangle",
            style: new Style({
                stroke: "blue",
                strokeWidth: 10,
                x: graphic.style.x,
                y: graphic.style.y,
                width: graphic.style.width,
                height: graphic.style.height,
                fill: "none"
            })
        });
    } else if (graphic.type === "ellipse") {
        return new Graphic({
            type: "rectangle",
            style: new Style({
                stroke: "blue",
                strokeWidth: 10,
                x: graphic.style.x! - graphic.style.width! * 0.5,
                y: graphic.style.y! - graphic.style.height! * 0.5,
                width: graphic.style.width,
                height: graphic.style.height,
                fill: "none"
            })
        });
    } else if (graphic.type === "polyline") {
        // Get the min and max of the points in the line to set the bounding box height and width
        const xCoordinates: Array<number> = graphic.style.points!.map<number>((point: Point): number => point.x);
        const yCoordinates: Array<number> = graphic.style.points!.map<number>((point: Point): number => point.y);
        const minimumPoint: Point = new Point(Math.min(...xCoordinates), Math.min(...yCoordinates));
        const maximumPoint: Point = new Point(Math.max(...xCoordinates), Math.max(...yCoordinates));

        return new Graphic({
            type: "rectangle",
            style: new Style({
                stroke: "blue",
                strokeWidth: 10,
                x: minimumPoint.x,
                y: minimumPoint.y,
                width: maximumPoint.x - minimumPoint.x,
                height: maximumPoint.y - minimumPoint.y,
                fill: "none"
            })
        });
    } else if (graphic.type === "curve") {
        // Get all of the non-control points
        const anchorPoints: Array<Point> = [];
        for (let i = 0; i < graphic.style.points!.length; i += 3) {
            anchorPoints.push(graphic.style.points![i]);
        }

        // Get the min and max of the points in the line to set the bounding box height and width
        const xCoordinates: Array<number> = anchorPoints.map<number>((point: Point): number => point.x);
        const yCoordinates: Array<number> = anchorPoints.map<number>((point: Point): number => point.y);
        const minimumPoint: Point = new Point(Math.min(...xCoordinates), Math.min(...yCoordinates));
        const maximumPoint: Point = new Point(Math.max(...xCoordinates), Math.max(...yCoordinates));

        return new Graphic({
            type: "rectangle",
            style: new Style({
                stroke: "blue",
                strokeWidth: 10,
                x: minimumPoint.x,
                y: minimumPoint.y,
                width: maximumPoint.x - minimumPoint.x,
                height: maximumPoint.y - minimumPoint.y,
                fill: "none"
            })
        });
    } else if (graphic.type === "text") {
        const lines: Array<string> = graphic.style.message!.split("\n");
        return new Graphic({
            type: "rectangle",
            style: new Style({
                stroke: "blue",
                strokeWidth: 10,
                x: graphic.style.x,
                y: graphic.style.y,
                width: Math.max(...lines.map<number>((line: string): number => line.length)) * 8,
                height: lines.length * 20,
                fill: "none"
            })
        });
    }

    throw `Undefined type of graphic: ${graphic.type}`;
}

function modelPolyline(svg: SVG.PolyLine, points: Array<Point>): Graphic {
    return new Graphic({
        type: "polyline",
        style: new Style({
            fill: svg.attr("fill"),
            stroke: svg.attr("stroke"),
            strokeWidth: svg.attr("stroke-width"),
            points: points
        })
    });
}

function modelCurve(svg: SVG.Path, points: Array<Point>): Graphic {
    return new Graphic({
        type: "curve",
        style: new Style({
            fill: svg.attr("fill"),
            stroke: svg.attr("stroke"),
            strokeWidth: svg.attr("stroke-width"),
            points: points
        })
    });
}

function modelRectangle(svg: SVG.Rect): Graphic {
    return new Graphic({
        type: "rectangle",
        style: new Style({
            fill: svg.attr("fill"),
            x: svg.x(),
            y: svg.y(),
            width: svg.width(),
            height: svg.height()
        })
    });
}

function modelEllipse(svg: SVG.Ellipse): Graphic {
    return new Graphic({
        type: "ellipse",
        style: new Style({
            fill: svg.attr("fill"),
            x: svg.cx(),
            y: svg.cy(),
            width: svg.width(),
            height: svg.height()
        })
    });
}

function modelText(svg: SVG.Text): Graphic {
    return new Graphic({
        type: "text",
        style: new Style({
            x: svg.x(),
            y: svg.y(),
            message: svg.text()
        })
    });
}

export default {
    render,
    modelBoundingBox,
    modelPolyline,
    modelCurve,
    modelRectangle,
    modelEllipse,
    modelText
};
