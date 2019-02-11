import Point from "../models/Point";
import Tool from "../models/Tool";
import IGraphic from "../models/IGraphic";
import Rectangle from "../models/Rectangle";
import Ellipse from "../models/Ellipse";
import Curve from "../models/Curve";
import Sketch from "../models/Sketch";
import Text from "../models/Text";
import * as SVG from "svg.js";
import SlideWrapper from "./SlideWrapper";

function getMousePosition(event: CustomEvent, store: any): Point {
    const mouseEvent: MouseEvent = event.detail.baseEvent as MouseEvent;
    const zoom: number = store.getters.canvasZoom;
    const resolution: number = store.getters.canvasResolution;
    // const bounds: DOMRect = el.getBoundingClientRect();
    return new Point(mouseEvent.clientX, mouseEvent.clientY)
        .scale(1 / zoom)
        // .add(new Point(-bounds.left, -bounds.top))
        .scale(resolution).transform(Math.round);
}

function focusGraphic(slide: any, graphic?: IGraphic, refresh: boolean = true): void {
    slide.$store.commit("focusGraphic", graphic);
    slide.$store.commit("styleEditorObject", graphic);

    if (refresh) {
        slide.refreshCanvas();
    }
}

function isolateEvent(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
}

// Cursor Tool handlers
const cursorTool: Tool = new Tool("cursor", {
    graphicMouseOver: (svg: SVG.Element) => (): any => svg.style("cursor", "pointer"),
    graphicMouseOut: (svg: SVG.Element) => (): any => svg.style("cursor", "default"),
    graphicMouseDown: (slide: any, svg: SVG.Element, graphic: IGraphic) => (event: MouseEvent): any => {
        isolateEvent(event);

        slide.canvas.on("mousemove", preview);
        slide.canvas.on("mouseup", end);

        if (slide.$store.getters.focusedGraphic === undefined || slide.$store.getters.focusedGraphic.id !== graphic.id) {
            focusGraphic(slide, graphic, false);
        }

        const start: Point = new Point(svg.x(), svg.y());
        const offset: Point = start.add(getMousePosition(slide, event).scale(-1));

        // Preview moving shape
        function preview(event: MouseEvent): void {
            isolateEvent(event);

            const resolvedPosition: Point = getMousePosition(slide, event).add(offset);
            svg.move(resolvedPosition.x, resolvedPosition.y);
        }

        // End moving shape
        function end(): void {
            slide.canvas.off("mousemove", preview);
            slide.canvas.off("mouseup", end);

            // Update the graphic model based on the modifications made to the graphic render
            if (graphic instanceof Rectangle) {
                (graphic as Rectangle).origin = new Point(svg.x(), svg.y());
            } else if (graphic instanceof Ellipse) {
                (graphic as Ellipse).origin = new Point(svg.cx(), svg.cy());
            } else if (graphic instanceof Curve) {
                const flattenedPoints: Array<Array<number>> = (svg as SVG.Path).array().value as any as Array<Array<number>>;
                (graphic as Curve).points = [new Point(flattenedPoints[0][1], flattenedPoints[0][2])];
                flattenedPoints.slice(1).forEach((point: Array<number>) => {
                    (graphic as Curve).points.push(new Point(point[1], point[2]));
                    (graphic as Curve).points.push(new Point(point[3], point[4]));
                    (graphic as Curve).points.push(new Point(point[5], point[6]));
                });
            } else if (graphic instanceof Sketch) {
                const flattenedPoints: Array<Array<number>> = (svg as SVG.PolyLine).array().value as any as Array<Array<number>>;
                (graphic as Sketch).points = flattenedPoints.map<Point>((point: Array<number>): Point => new Point(point[0], point[1]));
            } else if (graphic instanceof Text) {
                (graphic as Text).origin = new Point(svg.x(), svg.y());
            }

            slide.$store.commit("styleEditorObject", undefined);
            slide.$store.commit("styleEditorObject", graphic);
            slide.refreshCanvas();
        }
    },
    canvasMouseDown: (slide: any) => (): void => {
        if (slide.$store.getters.focusedGraphic !== undefined) {
            focusGraphic(slide, undefined);
        }
    }
});

// Event handlers for using the pencil tool
const pencilTool: Tool = new Tool("pencil", {
    canvasMouseOver: (slideWrapper: SlideWrapper) => (): void => slideWrapper.setCursor("crosshair"),
    canvasMouseOut: (slideWrapper: SlideWrapper) => (): void => slideWrapper.setCursor("default"),
    canvasMouseDown: (slideWrapper: SlideWrapper) => (event: CustomEvent): void => {
        document.addEventListener("Deck.CanvasMouseMove", preview);
        document.addEventListener("Deck.CanvasMouseUp", end);

        // Unfocus the current graphic if any and set initial state of pencil drawing
        slideWrapper.store.commit("focusGraphic", undefined);
        slideWrapper.store.commit("styleEditorObject", undefined);
        const sketch: Sketch = new Sketch({ points: [getMousePosition(event, slideWrapper.store)], fillColor: "none", strokeColor: "black", strokeWidth: 3 });
        slideWrapper.addGraphic(sketch);

        // Add the current mouse position to the list of points to plot
        function preview(event: Event): void {
            sketch.points.push(getMousePosition(event as CustomEvent, slideWrapper.store));
            slideWrapper.updateGraphic(sketch.id, sketch);
        }

        // Unbind handlers and commit graphic to the application
        function end(): void {
            document.removeEventListener("Deck.CanvasMouseMove", preview);
            document.removeEventListener("Deck.CanvasMouseUp", end);

            slideWrapper.store.commit("focusGraphic", sketch);
            slideWrapper.store.commit("styleEditorObject", sketch);
        }
    }
});

let penToolIsActive: boolean = false;
const penTool: Tool = new Tool("pen", {
    canvasMouseOver: (slideWrapper: SlideWrapper) => (): void => slideWrapper.setCursor("crosshair"),
    canvasMouseOut: (slideWrapper: SlideWrapper) => (): void => slideWrapper.setCursor("default"),
    canvasMouseDown: (slideWrapper: SlideWrapper) => (event: CustomEvent): void => {
        // Prevent any action on canvas click if a bezier curve is being drawn
        if (penToolIsActive) { return; }
        else { penToolIsActive = true; }

        document.addEventListener("keydown", end);
        document.addEventListener("Deck.CanvasMouseMove", preview);
        document.addEventListener("Deck.CanvasMouseUp", setFirstControlPoint);

        slideWrapper.store.commit("focusGraphic", undefined);
        slideWrapper.store.commit("styleEditorObject", undefined);

        // Create SVGs for the primary curve, the editable curve segment, and the control point preview
        const start: Point = getMousePosition(event, slideWrapper.store);
        const resolution: number = slideWrapper.store.getters.canvasResolution;

        const curve: Curve = new Curve({ points: [start], fillColor: "none", strokeColor: "black", strokeWidth: resolution * 3 });
        const segment: Curve = new Curve({ points: [ start, Point.undefined, Point.undefined, Point.undefined ],
            fillColor: "none", strokeColor: "black", strokeWidth: resolution * 3 });
        const handle: Sketch = new Sketch({ points: [], fillColor: "none", strokeWidth: resolution });

        slideWrapper.addGraphic(curve);
        slideWrapper.addGraphic(segment);
        slideWrapper.addGraphic(handle);

        function setFirstControlPoint(event: Event): void {
            document.removeEventListener("Deck.CanvasMouseUp", setFirstControlPoint);
            document.addEventListener("Deck.CanvasMouseDown", setEndpoint);

            segment.points[1] = getMousePosition(event as CustomEvent, slideWrapper.store);
        }

        function setEndpoint(event: Event): void {
            document.removeEventListener("Deck.CanvasMouseDown", setEndpoint);
            document.addEventListener("Deck.CanvasMouseUp", setSecondControlPoint);

            segment.points[3] = getMousePosition(event as CustomEvent, slideWrapper.store);
        }

        function setSecondControlPoint(event: Event): void {
            document.removeEventListener("Deck.CanvasMouseUp", setSecondControlPoint);

            // Complete the curve segment and add it to the final curve
            segment.points[2] = getMousePosition(event as CustomEvent, slideWrapper.store).reflect(segment.points[3]);
            curve.points.push(...segment.points.slice(1));

            // Reset the curve segment and set the first control point
            segment.points = [ segment.points[3], Point.undefined, Point.undefined, Point.undefined ];
            setFirstControlPoint(event);
        }

        function preview(event: Event): void {
            // Redraw the current curve segment as the mouse moves around
            const position: Point = getMousePosition(event as CustomEvent, slideWrapper.store);
            slideWrapper.updateGraphic(segment.id, { points: resolveCurve(segment.points, position) });

            // Display the control point shape if the endpoint is defined
            if (segment.points[3] !== Point.undefined) {
                handle.points = [ position.reflect(segment.points[3]), position];
                handle.strokeColor = "blue";
            } else {
                handle.strokeColor = "none";
            }
        }

        function end(event: KeyboardEvent): void {
            // Check if the pressed key is not one of the specified keys to end the curve drawing
            if (["Escape", "Enter", "Tab"].indexOf(event.key) === -1) {
                return;
            }

            penToolIsActive = false;
            document.removeEventListener("keydown", end);
            document.removeEventListener("Deck.CanvasMouseMove", preview);
        }

        // Convert a curve with possible undefined values to a curve with defined fallback values
        function resolveCurve(curve: Array<Point>, defaultPoint: Point): Array<Point> {
            return [
                curve[0] === Point.undefined ? defaultPoint : curve[0],
                curve[1] === Point.undefined ? defaultPoint : curve[1],
                curve[2] === Point.undefined ? (curve[3] !== Point.undefined ? defaultPoint.reflect(curve[3]) : defaultPoint) : curve[2],
                curve[3] === Point.undefined ? defaultPoint : curve[3],
            ];
        }
    }
});

// Rectangle tool handlers
const rectangleTool: Tool = new Tool("rectangle", {
    canvasMouseOver: (slideWrapper: SlideWrapper) => (): void => slideWrapper.setCursor("crosshair"),
    canvasMouseOut: (slideWrapper: SlideWrapper) => (): void => slideWrapper.setCursor("default"),
    canvasMouseDown: (slideWrapper: SlideWrapper) => (event: CustomEvent): void => {
        document.addEventListener("Deck.CanvasMouseMove", preview);
        document.addEventListener("Deck.CanvasMouseUp", end);
        document.addEventListener("keydown", toggleSquare);
        document.addEventListener("keyup", toggleSquare);

        slideWrapper.store.commit("focusGraphic", undefined);
        slideWrapper.store.commit("styleEditorObject", undefined);
        const start: Point = getMousePosition(event, slideWrapper.store);
        const rectangle: Rectangle = new Rectangle({ origin: start });
        slideWrapper.addGraphic(rectangle);
        let lastPosition: Point = new Point((event.detail.baseEvent as MouseEvent).clientX, (event.detail.baseEvent as MouseEvent).clientY);

        // Preview drawing rectangle
        function preview(event: Event): void {
            // Determine dimensions for a rectangle or square (based on if shift is pressed)
            const mouseEvent: MouseEvent = (event as CustomEvent).detail.baseEvent as MouseEvent;
            lastPosition = new Point(mouseEvent.clientX, mouseEvent.clientY);

            const position: Point = getMousePosition(event as CustomEvent, slideWrapper.store);
            const rawDimensions: Point = position.add(start.scale(-1));
            const minimumDimension: number = Math.min(Math.abs(rawDimensions.x), Math.abs(rawDimensions.y));
            const dimensions: Point = mouseEvent.shiftKey
                ? new Point(Math.sign(rawDimensions.x) * minimumDimension, Math.sign(rawDimensions.y) * minimumDimension)
                : rawDimensions;

            // Check if the dimensions are negative and move (x, y) or resize
            const move: Point = mouseEvent.shiftKey ? start.add(dimensions) : position;
            rectangle.origin.x = dimensions.x < 0 ? move.x : start.x;
            rectangle.origin.y = dimensions.y < 0 ? move.y : start.y;
            rectangle.width = Math.abs(dimensions.x);
            rectangle.height = Math.abs(dimensions.y);
            slideWrapper.updateGraphic(rectangle.id, rectangle);
        }

        // End drawing rectangle
        function end(): void {
            document.removeEventListener("Deck.CanvasMouseMove", preview);
            document.removeEventListener("Deck.CanvasMouseUp", end);
            document.removeEventListener("keydown", toggleSquare);
            document.removeEventListener("keyup", toggleSquare);
        }

        function toggleSquare(event: KeyboardEvent): void {
            if (event.key !== "Shift") {
                return;
            }

            document.dispatchEvent(new CustomEvent("Deck.CanvasMouseMove", {
                detail: {
                    baseEvent: new MouseEvent("mousemove", {
                        shiftKey: event.type === "keydown",
                        clientX: lastPosition.x,
                        clientY: lastPosition.y
                    }),
                    slideId: slideWrapper.slideId
                }
            }));
        }
    }
});

const ellipseTool: Tool = new Tool("ellipse", {
    canvasMouseOver: (slideWrapper: SlideWrapper) => (): void => slideWrapper.setCursor("crosshair"),
    canvasMouseOut: (slideWrapper: SlideWrapper) => (): void => slideWrapper.setCursor("default"),
    canvasMouseDown: (slideWrapper: SlideWrapper) => (event: CustomEvent): void => {
        document.addEventListener("Deck.CanvasMouseMove", preview);
        document.addEventListener("Deck.CanvasMouseUp", end);
        document.addEventListener("keydown", toggleCircle);
        document.addEventListener("keyup", toggleCircle);

        slideWrapper.store.commit("focusGraphic", undefined);
        slideWrapper.store.commit("styleEditorObject", undefined);
        const start: Point = getMousePosition(event, slideWrapper.store);
        const ellipse: Ellipse = new Ellipse({ origin: start });
        let lastPosition: Point = new Point((event.detail.baseEvent as MouseEvent).clientX, (event.detail.baseEvent as MouseEvent).clientY);

        // Preview drawing ellipse
        function preview(event: Event): void {
            // Determine dimensions for an ellipse or circle (based on if shift is pressed)
            const mouseEvent: MouseEvent = (event as CustomEvent).detail.baseEvent as MouseEvent;
            lastPosition = new Point(mouseEvent.clientX, mouseEvent.clientY);
            const position: Point = getMousePosition(event as CustomEvent, slideWrapper.store);
            const rawOffset: Point = position.add(start.scale(-1));
            const minimumOffset: number = Math.min(Math.abs(rawOffset.x), Math.abs(rawOffset.y));
            const resolvedOffset: Point = mouseEvent.shiftKey
                ? new Point(Math.sign(rawOffset.x) * minimumOffset, Math.sign(rawOffset.y) * minimumOffset) : rawOffset;
            const center: Point = start.add(start).add(resolvedOffset).scale(0.5);

            // Check if the dimensions are negative and move (x, y) or resize
            ellipse.origin.x = center.x;
            ellipse.origin.y = center.y;
            ellipse.width = Math.abs(resolvedOffset.x);
            ellipse.height = Math.abs(resolvedOffset.y);
            slideWrapper.updateGraphic(ellipse.id, ellipse);
        }

        // End drawing ellipse
        function end(): void {
            document.removeEventListener("Deck.CanvasMouseMove", preview);
            document.removeEventListener("Deck.CanvasMouseUp", end);
            document.removeEventListener("keydown", toggleCircle);
            document.removeEventListener("keyup", toggleCircle);
        }

        function toggleCircle(event: KeyboardEvent): void {
            if (event.key !== "Shift") {
                return;
            }

            document.dispatchEvent(new CustomEvent("Deck.CanvasMouseMove", {
                detail: {
                    baseEvent: new MouseEvent("mousemove", {
                        shiftKey: event.type === "keydown",
                        clientX: lastPosition.x,
                        clientY: lastPosition.y
                    }),
                    slideId: slideWrapper.slideId
                }
            }));
        }
    }
});

const textboxTool: Tool = new Tool("textbox", {
    canvasMouseOver: (slideWrapper: SlideWrapper) => (): void => slideWrapper.setCursor("text"),
    canvasMouseOut: (slideWrapper: SlideWrapper) => (): void => slideWrapper.setCursor("default"),
    canvasMouseDown: (slideWrapper: SlideWrapper) => (event: CustomEvent): void => {
        slideWrapper.store.commit("focusGraphic", undefined);
        slideWrapper.store.commit("styleEditorObject", undefined);

        const text: Text = new Text({ origin: getMousePosition(event, slideWrapper.store), content: "lorem ipsum\ndolor sit amet" });
        slideWrapper.addGraphic(text);
    }
});

export default {
    cursorTool,
    pencilTool,
    penTool,
    rectangleTool,
    ellipseTool,
    textboxTool
};
