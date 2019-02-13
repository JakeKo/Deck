import Point from "../models/Point";
import Tool from "../models/Tool";
import IGraphic from "../models/IGraphic";
import Rectangle from "../models/Rectangle";
import Ellipse from "../models/Ellipse";
import Curve from "../models/Curve";
import Sketch from "../models/Sketch";
import Text from "../models/Text";
import SlideWrapper from "./SlideWrapper";

function getPosition(event: CustomEvent, store: any): Point {
    const mouseEvent: MouseEvent = event.detail.baseEvent as MouseEvent;
    const zoom: number = store.getters.canvasZoom;
    const resolution: number = store.getters.canvasResolution;
    return new Point(Math.round((mouseEvent.offsetX / zoom) * resolution), Math.round((mouseEvent.offsetY / zoom) * resolution));
}

// Cursor Tool handlers
const cursorTool: Tool = new Tool("cursor", {
    graphicMouseOver: (slideWrapper: SlideWrapper) => (): void => slideWrapper.setCursor("pointer"),
    graphicMouseOut: (slideWrapper: SlideWrapper) => (): void => slideWrapper.setCursor("default"),
    graphicMouseDown: (slideWrapper: SlideWrapper) => (event: CustomEvent): void => {
        const graphic: IGraphic | undefined = slideWrapper.getGraphic(event.detail.graphicId);
        if (graphic === undefined) {
            console.error(`ERROR: Could not find a graphic with the id: ${event.detail.graphicId}`);
            return;
        }

        slideWrapper.store.commit("focusGraphic", graphic);
        slideWrapper.store.commit("styleEditorObject", graphic);

        const initialPosition: Point = getPosition(event, slideWrapper.store);
        const initialOrigin: Point = graphic.origin;

        document.addEventListener("Deck.CanvasMouseMove", preview);
        document.addEventListener("Deck.CanvasMouseUp", end);
        document.addEventListener("Deck.GraphicMouseUp", end);

        // Preview moving shape
        function preview(event: Event): void {
            const position: Point = getPosition(event as CustomEvent, slideWrapper.store);
            const cursorOffset: Point = position.add(initialPosition.scale(-1));
            graphic!.origin = initialOrigin.add(cursorOffset);
            slideWrapper.updateGraphic(graphic!.id, graphic!);
        }

        // End moving shape
        function end(): void {
            document.removeEventListener("Deck.CanvasMouseMove", preview);
            document.removeEventListener("Deck.CanvasMouseUp", end);
            document.removeEventListener("Deck.GraphicMouseUp", end);

            slideWrapper.store.commit("focusGraphic", undefined);
            slideWrapper.store.commit("styleEditorObject", undefined);
            slideWrapper.store.commit("focusGraphic", graphic);
            slideWrapper.store.commit("styleEditorObject", graphic);
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
        document.addEventListener("Deck.GraphicMouseUp", end);

        // Unfocus the current graphic if any and set initial state of pencil drawing
        slideWrapper.store.commit("focusGraphic", undefined);
        slideWrapper.store.commit("styleEditorObject", undefined);
        const sketch: Sketch = new Sketch({ origin: getPosition(event, slideWrapper.store), fillColor: "none", strokeColor: "black", strokeWidth: 3 });
        slideWrapper.addGraphic(sketch);

        // Add the current mouse position to the list of points to plot
        function preview(event: Event): void {
            sketch.points.push(getPosition(event as CustomEvent, slideWrapper.store).add(sketch.origin.scale(-1)));
            slideWrapper.updateGraphic(sketch.id, sketch);
        }

        // Unbind handlers and commit graphic to the application
        function end(): void {
            document.removeEventListener("Deck.CanvasMouseMove", preview);
            document.removeEventListener("Deck.CanvasMouseUp", end);
            document.removeEventListener("Deck.GraphicMouseUp", end);

            slideWrapper.store.commit("addGraphic", { slideId: slideWrapper.slideId, graphic: sketch });
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
        document.addEventListener("Deck.GraphicMouseUp", setFirstControlPoint);

        slideWrapper.store.commit("focusGraphic", undefined);
        slideWrapper.store.commit("styleEditorObject", undefined);

        // Create SVGs for the primary curve, the editable curve segment, and the control point preview
        const start: Point = getPosition(event, slideWrapper.store);
        const resolution: number = slideWrapper.store.getters.canvasResolution;

        let segmentPoints: Array<Point> = [Point.undefined, Point.undefined, Point.undefined];
        const curve: Curve = new Curve({ origin: start, fillColor: "none", strokeColor: "black", strokeWidth: resolution * 3 });
        const segment: Curve = new Curve({ origin: start, points: resolveCurve(segmentPoints, new Point(0, 0)), fillColor: "none", strokeColor: "black", strokeWidth: resolution * 3 });
        const handle: Sketch = new Sketch({ fillColor: "none", strokeColor: "blue", strokeWidth: resolution });

        slideWrapper.addGraphic(curve);
        slideWrapper.addGraphic(segment);
        slideWrapper.addGraphic(handle);

        function setFirstControlPoint(event: Event): void {
            document.removeEventListener("Deck.CanvasMouseUp", setFirstControlPoint);
            document.removeEventListener("Deck.GraphicMouseUp", setFirstControlPoint);
            document.addEventListener("Deck.CanvasMouseDown", setEndpoint);
            document.addEventListener("Deck.GraphicMouseDown", setEndpoint);

            segmentPoints[0] = getPosition(event as CustomEvent, slideWrapper.store).add(segment.origin.scale(-1));
        }

        function setEndpoint(event: Event): void {
            document.removeEventListener("Deck.CanvasMouseDown", setEndpoint);
            document.removeEventListener("Deck.GraphicMouseDown", setEndpoint);
            document.addEventListener("Deck.CanvasMouseUp", setSecondControlPoint);
            document.addEventListener("Deck.GraphicMouseUp", setSecondControlPoint);

            segmentPoints[2] = getPosition(event as CustomEvent, slideWrapper.store).add(segment.origin.scale(-1));
        }

        function setSecondControlPoint(event: Event): void {
            document.removeEventListener("Deck.CanvasMouseUp", setSecondControlPoint);
            document.removeEventListener("Deck.GraphicMouseUp", setSecondControlPoint);

            // Complete the curve segment and add it to the final curve
            segmentPoints[1] = getPosition(event as CustomEvent, slideWrapper.store).add(segment.origin.scale(-1)).reflect(segmentPoints[2]);
            curve.points.push(...segmentPoints);

            // Reset the curve segment and set the first control point
            segment.origin = segmentPoints[2].add(segment.origin);
            segmentPoints = [Point.undefined, Point.undefined, Point.undefined];
            setFirstControlPoint(event);
        }

        function preview(event: Event): void {
            // Redraw the current curve segment as the mouse moves around
            const position: Point = getPosition(event as CustomEvent, slideWrapper.store);
            segment.points = resolveCurve(segmentPoints, position.add(segment.origin.scale(-1)));
            slideWrapper.updateGraphic(segment.id, segment);
            slideWrapper.updateGraphic(curve.id, curve);

            // Display the control point shape if the endpoint is defined
            if (segmentPoints[2] !== Point.undefined) {
                handle.origin = position;
                handle.points = [position.reflect(segment.points[2].add(segment.origin)).add(position.scale(-1))];
                handle.strokeColor = "blue";
            } else {
                handle.strokeColor = "none";
            }

            slideWrapper.updateGraphic(handle.id, handle);
        }

        function end(event: KeyboardEvent): void {
            // Check if the pressed key is not one of the specified keys to end the curve drawing
            if (["Escape", "Enter", "Tab"].indexOf(event.key) === -1) {
                return;
            }

            penToolIsActive = false;
            slideWrapper.removeGraphic(handle.id);
            slideWrapper.removeGraphic(segment.id);
            document.removeEventListener("keydown", end);
            document.removeEventListener("Deck.CanvasMouseMove", preview);

            slideWrapper.store.commit("addGraphic", { slideId: slideWrapper.slideId, graphic: curve });
            slideWrapper.store.commit("focusGraphic", curve);
            slideWrapper.store.commit("styleEditorObject", curve);
        }

        // Convert a curve with possible undefined values to a curve with defined fallback values
        function resolveCurve(curve: Array<Point>, defaultPoint: Point): Array<Point> {
            return [
                curve[0] === Point.undefined ? defaultPoint : curve[0],
                curve[1] === Point.undefined ? (curve[2] !== Point.undefined ? defaultPoint.reflect(curve[2]) : defaultPoint) : curve[1],
                curve[2] === Point.undefined ? defaultPoint : curve[2],
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
        document.addEventListener("Deck.GraphicMouseUp", end);
        document.addEventListener("keydown", toggleSquare);
        document.addEventListener("keyup", toggleSquare);

        slideWrapper.store.commit("focusGraphic", undefined);
        slideWrapper.store.commit("styleEditorObject", undefined);
        const start: Point = getPosition(event, slideWrapper.store);
        const rectangle: Rectangle = new Rectangle({ origin: new Point(start.x, start.y), fillColor: "black", strokeColor: "none", width: 1, height: 1 });
        slideWrapper.addGraphic(rectangle);
        let lastPosition: Point = new Point((event.detail.baseEvent as MouseEvent).clientX, (event.detail.baseEvent as MouseEvent).clientY);
        let shiftPressed = false;

        // Preview drawing rectangle
        function preview(event: Event): void {
            // Determine dimensions for a rectangle or square (based on if shift is pressed)
            const mouseEvent: MouseEvent = (event as CustomEvent).detail.baseEvent as MouseEvent;
            lastPosition = new Point(mouseEvent.clientX, mouseEvent.clientY);

            const position: Point = getPosition(event as CustomEvent, slideWrapper.store);
            const rawDimensions: Point = position.add(start.scale(-1));
            const minimumDimension: number = Math.min(Math.abs(rawDimensions.x), Math.abs(rawDimensions.y));

            // Enforce that a shape has positive width and height i.e. move the x and y if the width or height are negative
            rectangle.origin.x = rawDimensions.x < 0 ? start.x + (mouseEvent.shiftKey ? -minimumDimension : rawDimensions.x) : rectangle.origin.x;
            rectangle.origin.y = rawDimensions.y < 0 ? start.y + (mouseEvent.shiftKey ? -minimumDimension : rawDimensions.y) : rectangle.origin.y;

            rectangle.width = mouseEvent.shiftKey ? minimumDimension : Math.abs(rawDimensions.x);
            rectangle.height = mouseEvent.shiftKey ? minimumDimension : Math.abs(rawDimensions.y);
            slideWrapper.updateGraphic(rectangle.id, rectangle);
        }

        // End drawing rectangle
        function end(): void {
            document.removeEventListener("Deck.CanvasMouseMove", preview);
            document.removeEventListener("Deck.CanvasMouseUp", end);
            document.removeEventListener("Deck.GraphicMouseUp", end);
            document.removeEventListener("keydown", toggleSquare);
            document.removeEventListener("keyup", toggleSquare);

            slideWrapper.store.commit("addGraphic", { slideId: slideWrapper.slideId, graphic: rectangle });
            slideWrapper.store.commit("focusGraphic", rectangle);
            slideWrapper.store.commit("styleEditorObject", rectangle);
        }

        function toggleSquare(event: KeyboardEvent): void {
            if (event.key !== "Shift" || (event.type === "keydown" && shiftPressed)) {
                return;
            }

            shiftPressed = event.type === "keydown";
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
        document.addEventListener("Deck.GraphicMouseUp", end);
        document.addEventListener("keydown", toggleCircle);
        document.addEventListener("keyup", toggleCircle);

        slideWrapper.store.commit("focusGraphic", undefined);
        slideWrapper.store.commit("styleEditorObject", undefined);
        const start: Point = getPosition(event, slideWrapper.store);
        const ellipse: Ellipse = new Ellipse({ origin: new Point(start.x, start.y), fillColor: "black", strokeColor: "none", width: 1, height: 1 });
        slideWrapper.addGraphic(ellipse);
        let lastPosition: Point = new Point((event.detail.baseEvent as MouseEvent).clientX, (event.detail.baseEvent as MouseEvent).clientY);
        let shiftPressed = false;

        // Preview drawing ellipse
        function preview(event: Event): void {
            // Determine dimensions for an ellipse or circle (based on if shift is pressed)
            const mouseEvent: MouseEvent = (event as CustomEvent).detail.baseEvent as MouseEvent;
            lastPosition = new Point(mouseEvent.clientX, mouseEvent.clientY);

            const position: Point = getPosition(event as CustomEvent, slideWrapper.store);
            const rawOffset: Point = position.add(start.scale(-1));
            const minimumOffset: number = Math.min(Math.abs(rawOffset.x), Math.abs(rawOffset.y));

            // Enforce that a shape has positive width and height i.e. move the x and y if the width or height are negative
            ellipse.origin.x = start.x + (mouseEvent.shiftKey ? Math.sign(rawOffset.x) * minimumOffset : rawOffset.x) * 0.5;
            ellipse.origin.y = start.y + (mouseEvent.shiftKey ? Math.sign(rawOffset.y) * minimumOffset : rawOffset.y) * 0.5;

            ellipse.width = mouseEvent.shiftKey ? minimumOffset : Math.abs(rawOffset.x);
            ellipse.height = mouseEvent.shiftKey ? minimumOffset : Math.abs(rawOffset.y);
            slideWrapper.updateGraphic(ellipse.id, ellipse);
        }

        // End drawing ellipse
        function end(): void {
            document.removeEventListener("Deck.CanvasMouseMove", preview);
            document.removeEventListener("Deck.CanvasMouseUp", end);
            document.removeEventListener("Deck.GraphicMouseUp", end);
            document.removeEventListener("keydown", toggleCircle);
            document.removeEventListener("keyup", toggleCircle);

            slideWrapper.store.commit("addGraphic", { slideId: slideWrapper.slideId, graphic: ellipse });
            slideWrapper.store.commit("focusGraphic", ellipse);
            slideWrapper.store.commit("styleEditorObject", ellipse);
        }

        function toggleCircle(event: KeyboardEvent): void {
            if (event.key !== "Shift" || (event.type === "keydown" && shiftPressed)) {
                return;
            }

            shiftPressed = event.type === "keydown";
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

        const text: Text = new Text({ origin: getPosition(event, slideWrapper.store), content: "lorem ipsum\ndolor sit amet", fontSize: 24 });
        slideWrapper.addGraphic(text);

        slideWrapper.store.commit("addGraphic", { slideId: slideWrapper.slideId, graphic: text });
        slideWrapper.store.commit("focusGraphic", text);
        slideWrapper.store.commit("styleEditorObject", text);
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
